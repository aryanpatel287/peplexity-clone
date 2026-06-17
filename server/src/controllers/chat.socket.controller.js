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
            });

            if (!userFiles || !userFiles.length) {
                throw Error('Something went wrong while processing the files');
            }
        }

        const history = await messageModel.find({ chat: resolvedChatId });

        const onThinking = (thinking) => {
            socket.emit('chat:thinking', { chatId: resolvedChatId, thinking });
        };

        const onToolCall = (toolName) => {
            socket.emit('chat:tool_call', { chatId: resolvedChatId, toolName });
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

        socket.emit('chat:done', {
            chatId: resolvedChatId,
            messageId: aiMessage._id.toString(),
            finalText,
        });
    } catch (err) {
        console.error('[socket] handleChatSend error:', err);
        socket.emit('chat:error', {
            chatId: resolvedChatId ?? chatId,
            error: err?.message ?? 'Something went wrong',
        });
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
                    console.error(
                        `[socket] processFiles error for file ${file.name}:`,
                        fileError,
                    );
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
        console.error('[socket] processFiles database error:', dbError);

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
