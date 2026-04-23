import chatModel from '../models/chat.model.js';
import messageModel from '../models/message.model.js';
import { generateChatTitle, generateResponse } from '../services/ai.service.js';

async function sendMessage(req, res) {
    const { message, chat: chatId } = req.body;

    console.log('chatId: ', chatId);

    let chatTitle = null,
        chat = null;

    if (!chatId) {
        console.log('new chat created');
        chatTitle = await generateChatTitle(message);
        chat = await chatModel.create({
            user: req.user.id,
            title: chatTitle,
        });
    }

    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: 'user',
    });

    const messageHistory = await messageModel.find({
        chat: chatId || chat._id,
    });

    console.log('messageHistory: ', messageHistory);

    const aiResponse = await generateResponse(messageHistory);

    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: aiResponse,
        role: 'ai',
    });

    res.status(201).json({
        chat,
        aiMessage,
        userMessage,
        success: true,
    });
}

async function getChats(req, res) {
    const userId = req.user.id;

    const chats = await chatModel.find({ user: userId });

    res.status(200).json({
        message: 'chats fetched successfully',
        success: true,
        chats,
    });
}

async function getMessages(req, res) {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: userId,
    });

    if (!chat) {
        res.status(404).json({
            message: 'Chat not found',
            success: false,
            error: 'Chat not found',
        });
    }

    const messages = await messageModel.find({ chat: chatId });

    res.status(200).json({
        message: 'messages fetched successfully',
        success: true,
        messages,
    });
}

async function deleteChat(req, res) {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: userId,
    });

    const message = await messageModel.deleteMany({ chat: chatId });

    res.status(200).json({
        message: 'Chat deleted successfully',
        success: 'true',
    });
}

export { sendMessage, getChats, getMessages, deleteChat };

// // Success response:
// {
// "success": true,
// "message": "Human-readable status",
// "data": {},
// "error": null
// }

// // Error response:
// {
// "success": false,
// "message": "Human-readable failure",
// "data": null,
// "error": {
// "code": "SOME_ERROR_CODE",
// "details": "Optional technical details"
// }
// }
