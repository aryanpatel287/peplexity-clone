import { Router } from 'express';
import { authUserOrGuest } from '../middlewares/auth.middleware.js';
import {
    deleteChat,
    getChats,
    getMessages,
    sendMessage,
    uploadFileController,
} from '../controllers/chat.controller.js';
import multer from 'multer';

const chatRouter = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed!'), false);
        }
    },
});

/**
 * @route /api/chats/message
 * @description sends a message from user to the ai
 * @access Private/Guest
 * @body {message,chat}
 */
chatRouter.post('/message', authUserOrGuest, sendMessage);

/**
 * @route /api/chats/get-chats
 * @description get all chats of a user
 * @access Private/Guest
 * @body none
 */
chatRouter.get('/', authUserOrGuest, getChats);

/**
 * @route /api/chats/get-messages/:chatId
 * @description get all in a chat of a user
 * @access Private/Guest
 * @body none
 */
chatRouter.get('/:chatId/messages', authUserOrGuest, getMessages);

/**
 * @route /api/chats/delete-chat/:chatId
 * @description delete a chat of a user
 * @access Private/Guest
 * @body none
 */
chatRouter.delete('/delete/:chatId', authUserOrGuest, deleteChat);

/**
 * @route /api/chats/uploads
 * @description Upload the files provided by user
 * @access Private/Guest
 * @body none
 */
chatRouter.post(
    '/uploads',
    authUserOrGuest,
    upload.array('files', 5),
    uploadFileController,
);

//TODO: add validation for upload files size and the number of files that can be uploaded at once on client side

export default chatRouter;
