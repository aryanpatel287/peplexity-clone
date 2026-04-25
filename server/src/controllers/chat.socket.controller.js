import chatModel from '../models/chat.model.js';
import messageModel from '../models/message.model.js';
import { generateChatTitle, streamAiReponse } from '../services/ai.service.js';

export async function handleChatSend(socket, { message, chatId }) {
    const userId = socket.user?.id;

    try {
        let resolvedChatId = chatId;

        // --- New chat ---
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

        // Persist user message
        await messageModel.create({
            chat: resolvedChatId,
            content: message,
            role: 'user',
        });

        // Fetch full history for context-aware response
        const history = await messageModel.find({ chat: resolvedChatId });

        // --- Stream callbacks ---
        const onThinking = (thinking) => {
            socket.emit('chat:thinking', { chatId: resolvedChatId, thinking });
        };

        const onToolCall = (toolName) => {
            socket.emit('chat:tool_call', { chatId: resolvedChatId, toolName });
        };

        const finalText = await streamAiReponse(history, { onThinking, onToolCall });

        // Persist AI message
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
            chatId,
            error: err?.message ?? 'Something went wrong',
        });
    }
}
