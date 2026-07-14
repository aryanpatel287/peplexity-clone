import chatModel from '../models/chat.model.js';
import fileModel from '../models/file.model.js';
import messageModel from '../models/message.model.js';
import redis from '../config/cache.js';
import { dataIngestion } from '../rag/data-ingestion.rag.js';
import {
    generateChatTitle,
    streamAiReponse,
    summariseFileWithAi,
} from '../services/ai/response.ai.service.js';
import parseDocumentsByLlama from '../rag/llama-parser.rag.js';
import rollbar from '../services/rollbar.service.js';
import {
    startTracking,
    updateThinking,
    addToolCall,
    stopTracking,
} from '../services/ai/streamTracker.service.js';
import { getIO } from '../sockets/server.socket.js';

const getSocketRequestContext = (socket) => {
    if (!socket || !socket.handshake) return null;
    return {
        headers: socket.handshake.headers || {},
        url: socket.handshake.url || '',
        method: 'SOCKET',
        user: socket.user ? {
            id: socket.user.id || socket.user._id,
            username: socket.user.username,
            email: socket.user.email,
        } : null,
    };
};

export async function handleChatSend(
    socket,
    { message, chatId, uploadedFiles },
) {
    const userId = socket.user?.id;
    const isGuest = socket.user?.isGuest;
    const guestId = socket.user?.guestId;

    let resolvedChatId = chatId;

    try {
        if (isGuest && guestId) {
            const counterKey = `guest_msg_count:${guestId}`;
            const count = await redis.incr(counterKey);

            if (count > 2) {
                await redis.decr(counterKey);
                socket.emit('chat:error', {
                    chatId: resolvedChatId ?? chatId,
                    error: 'Please sign up to continue',
                    code: 'AUTH_REQUIRED',
                });
                return;
            }

            await redis.expire(counterKey, 60 * 60 * 24);
        }

        if (!chatId) {
            const title = await generateChatTitle(message);
            const chat = await chatModel.create(
                isGuest ? { guestId, title } : { user: userId, title },
            );
            resolvedChatId = chat._id.toString();

            socket.emit('chat:chat_created', {
                chatId: resolvedChatId,
                title,
                userMessage: message,
                uploadedFiles,
            });
        }

        await startTracking(resolvedChatId);
        socket.join(resolvedChatId);

        const io = getIO();

        const userMessage = await messageModel.create({
            chat: resolvedChatId,
            content: message,
            role: 'user',
        });

        let userFiles = [];
        if (uploadedFiles?.length) {
            userFiles = await processFiles({
                uploadedFiles,
                userMessageId: userMessage._id,
                userId,
                resolvedChatId,
                socket,
            });

            if (!userFiles || !userFiles.length) {
                throw Error('Something went wrong while processing the files');
            }
        }

        const history = await messageModel.find({ chat: resolvedChatId });

        const onThinking = async (thinking) => {
            await updateThinking(resolvedChatId, thinking);
            io.to(resolvedChatId).emit('chat:thinking', { chatId: resolvedChatId, thinking });
        };

        const onToolCall = async (toolName) => {
            await addToolCall(resolvedChatId, toolName);
            io.to(resolvedChatId).emit('chat:tool_call', { chatId: resolvedChatId, toolName });
        };

        const finalText = await streamAiReponse(history, userFiles, {
            onThinking,
            onToolCall,
            chatId: resolvedChatId,
        });

        const aiMessage = await messageModel.create({
            chat: resolvedChatId,
            content: finalText,
            role: 'ai',
        });

        io.to(resolvedChatId).emit('chat:done', {
            chatId: resolvedChatId,
            messageId: aiMessage._id.toString(),
            finalText,
        });
        await stopTracking(resolvedChatId);
    } catch (err) {
        const reqContext = getSocketRequestContext(socket);
        rollbar.error(err, reqContext);
        
        await stopTracking(resolvedChatId);
        
        const io = getIO();
        const target = resolvedChatId || chatId;
        if (target) {
            io.to(target).emit('chat:error', {
                chatId: target,
                error: err?.message ?? 'Something went wrong',
            });
        } else {
            socket.emit('chat:error', {
                chatId: null,
                error: err?.message ?? 'Something went wrong',
            });
        }
    }
}

function isPlainTextFile(file) {
    const name = file.name?.toLowerCase() || '';
    const mime = file.mimetype?.toLowerCase() || '';
    return (
        mime.startsWith('text/') ||
        mime === 'application/json' ||
        mime === 'application/javascript' ||
        mime === 'application/x-javascript' ||
        mime === 'application/xml' ||
        name.endsWith('.md') ||
        name.endsWith('.markdown') ||
        name.endsWith('.txt') ||
        name.endsWith('.json') ||
        name.endsWith('.csv') ||
        name.endsWith('.tsv') ||
        name.endsWith('.xml') ||
        name.endsWith('.yaml') ||
        name.endsWith('.yml') ||
        name.endsWith('.ini') ||
        name.endsWith('.conf') ||
        name.endsWith('.js') ||
        name.endsWith('.ts') ||
        name.endsWith('.jsx') ||
        name.endsWith('.tsx')
    );
}

async function processFiles({
    uploadedFiles,
    userMessageId,
    userId,
    resolvedChatId,
    socket,
}) {
    if (!uploadedFiles || !uploadedFiles.length) return [];

    try {
        const processed = await Promise.all(
            uploadedFiles.map(async (file) => {
                try {
                    if (file.mimetype?.startsWith('image/')) {
                        return {
                            ...file,
                            metadata: {},
                            processingStatus: 'completed',
                            isImage: true,
                        };
                    }

                    const isPlain = isPlainTextFile(file);
                    let parsedFile;

                    if (isPlain) {
                        const response = await fetch(file.url);
                        if (!response.ok) {
                            throw new Error(
                                `Failed to fetch plain text file from ${file.url}`,
                            );
                        }
                        const textContent = await response.text();
                        parsedFile = {
                            ...file,
                            markdown_full: textContent,
                            markdown: {
                                pages: [{ markdownText: textContent }],
                            },
                        };
                    } else {
                        const data = await parseDocumentsByLlama(file.url);
                        parsedFile = {
                            ...file,
                            markdown_full: data.markdown_full,
                            markdown: data.markdown,
                        };
                    }

                    const summarisedContent =
                        await summariseFileWithAi(parsedFile);
                    return {
                        ...parsedFile,
                        metadata: summarisedContent,
                        processingStatus: 'completed',
                        isImage: false,
                    };
                } catch (fileError) {
                    const reqContext = getSocketRequestContext(socket);
                    rollbar.error(fileError, reqContext, { fileName: file.name });
                    return {
                        ...file,
                        metadata: {},
                        processingStatus: 'failed',
                        isImage: false,
                    };
                }
            }),
        );

        const filesToCreate = processed.map((file) => ({
            fileId: file.fileId,
            name: file.name,
            size: file.size,
            filePath: file.filePath,
            url: file.url,
            fileType: file.fileType,
            mimetype: file.mimetype,
            message: userMessageId,
            uploadedBy: userId,
            metadata: file.metadata || {},
            processingStatus: file.processingStatus,
        }));

        const createdFiles = await fileModel.insertMany(filesToCreate);

        createdFiles.forEach((dbFile, index) => {
            const parsedFile = processed[index];
            if (parsedFile.isImage || parsedFile.processingStatus === 'failed')
                return;

            void dataIngestion({
                fileUrl: dbFile.url,
                file: dbFile._id,
                chat: resolvedChatId,
                documentType: dbFile.mimetype,
                source: dbFile.name,
                markdownContent: parsedFile.markdown,
            });
        });

        return createdFiles;
    } catch (dbError) {
        const reqContext = getSocketRequestContext(socket);
        rollbar.error(dbError, reqContext);

        const filesToCreate = uploadedFiles.map((file) => ({
            fileId: file.fileId,
            name: file.name,
            size: file.size,
            filePath: file.filePath,
            url: file.url,
            fileType: file.fileType,
            mimetype: file.mimetype,
            message: userMessageId,
            uploadedBy: userId,
            processingStatus: 'failed',
        }));

        return await fileModel.insertMany(filesToCreate);
    }
}
