import chatModel from '../models/chat.model.js';
import fileModel from '../models/file.model.js';
import messageModel from '../models/message.model.js';
import redis from '../config/cache.js';
import { dataIngestion } from '../rag/dataIngestion.rag.js';
import {
    generateChatTitle,
    streamAiReponse,
} from '../services/ai/response.ai.service.js';

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
                isGuest
                    ? { guestId, title }
                    : { user: userId, title },
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
            userFiles = await Promise.all(
                uploadedFiles.map((file) =>
                    fileModel.create({
                        fileId: file.fileId,
                        name: file.name,
                        size: file.size,
                        filePath: file.filePath,
                        url: file.url,
                        fileType: file.fileType,
                        mimetype: file.mimetype,
                        message: userMessage._id,
                        uploadedBy: userId,
                    }),
                ),
            );
        }

        if (userFiles?.length > 0) {
            void Promise.all(
                userFiles.map((file) =>
                    dataIngestion({
                        fileUrl: file.url,
                        file: file._id,
                        chat: resolvedChatId,
                        documentType: file.mimetype,
                        source: file.name,
                    }),
                ),
            );
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
