import chatModel from '../models/chat.model.js';
import fileModel from '../models/file.model.js';
import messageModel from '../models/message.model.js';
import redis from '../config/cache.js';
import {
    generateChatTitle,
    generateResponse,
    streamAiReponse,
} from '../services/ai/response.ai.service.js';
import { uploadMultipleImagesOnImageKit } from '../services/image.service.js';

async function sendMessage(req, res) {
    const { message, chat: chatId, uploadedFiles } = req.body;
    const isGuest = req.user?.isGuest;
    const guestId = req.user?.guestId;
    const userId = req.user?.id;

    let chatTitle = null,
        chat = null;

    if (isGuest && guestId) {
        const counterKey = `guest_msg_count:${guestId}`;
        const count = await redis.incr(counterKey);
        if (count > 2) {
            await redis.decr(counterKey);
            return res.status(401).json({
                message: 'Please sign up to continue',
                success: false,
                error: 'Guest limit reached',
                code: 'AUTH_REQUIRED',
            });
        }
        await redis.expire(counterKey, 60 * 60 * 24);
    }

    if (!chatId) {
        chatTitle = await generateChatTitle(message);
        const chatPayload = isGuest
            ? { guestId, title: chatTitle }
            : { user: userId, title: chatTitle };
        chat = await chatModel.create(chatPayload);
    }

    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: 'user',
    });

    let userFiles;
    if (uploadedFiles) {
        userFiles = await Promise.all(
            uploadedFiles.map(async (file) => {
                const result = await fileModel.create({
                    ...file,
                    message: userMessage._id,
                });
                return result;
            }),
        );
    }

    const resolvedChatId = chatId || chat._id.toString();

    const messageHistory = await messageModel.find({
        chat: resolvedChatId,
    });

    const aiResponse = await generateResponse(messageHistory, resolvedChatId);
    // const aiResponse = await streamAiReponse(messageHistory, userFiles);

    const aiMessage = await messageModel.create({
        chat: resolvedChatId,
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
    const isGuest = req.user?.isGuest;
    const guestId = req.user?.guestId;
    const userId = req.user?.id;

    const query = isGuest ? { guestId } : { user: userId };

    const chats = await chatModel.find(query);

    res.status(200).json({
        message: 'chats fetched successfully',
        success: true,
        chats,
    });
}

async function getMessages(req, res) {
    const { chatId } = req.params;
    const isGuest = req.user?.isGuest;
    const guestId = req.user?.guestId;
    const userId = req.user?.id;

    const chat = await chatModel.findOne(
        isGuest ? { _id: chatId, guestId } : { _id: chatId, user: userId },
    );

    if (!chat) {
        return res.status(404).json({
            message: 'Chat not found',
            success: false,
            error: 'Chat not found',
        });
    }

    const messages = await messageModel
        .find({ chat: chatId })
        .sort({ createdAt: 1 })
        .populate('files');

    res.status(200).json({
        message: 'messages fetched successfully',
        success: true,
        messages,
    });
}

async function deleteChat(req, res) {
    const { chatId } = req.params;
    const isGuest = req.user?.isGuest;
    const guestId = req.user?.guestId;
    const userId = req.user?.id;

    const chat = await chatModel.findOneAndDelete(
        isGuest ? { _id: chatId, guestId } : { _id: chatId, user: userId },
    );

    const message = await messageModel.deleteMany({ chat: chatId });

    res.status(200).json({
        message: 'Chat deleted successfully',
        success: 'true',
    });
}

/**
 * @description Upload the files provided by user
 * @route /api/chats/uploads
 * @access Private
 * @body none
 */
async function uploadFileController(req, res) {
    try {
        const uploadedFiles = await uploadMultipleImagesOnImageKit(req.files);

        res.status(200).json({
            message: 'Files uploaded successfully',
            success: true,
            uploadedFiles,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'File upload failed',
            success: false,
            error: 'File upload failed',
        });
    }
}

export { sendMessage, getChats, getMessages, deleteChat, uploadFileController };

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
