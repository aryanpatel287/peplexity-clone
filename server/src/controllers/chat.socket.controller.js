import chatModel from '../models/chat.model.js';
import fileModel from '../models/file.model.js';
import messageModel from '../models/message.model.js';
import { generateChatTitle, streamAiReponse } from '../services/ai.service.js';
// FIXME: The Response was not stored in the Database so fix that
// BUG: The Response was not stored in the Database
export async function handleChatSend(socket, { message, chatId, uploadedFiles }) {
    const userId = socket.user?.id;

    let resolvedChatId = chatId;

    try {

        if (!chatId) {
            const title = await generateChatTitle(message);
            const chat = await chatModel.create({ user: userId, title });
            resolvedChatId = chat._id.toString();

            socket.emit('chat:chat_created', {
                chatId: resolvedChatId,
                title,
                userMessage: message,
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
