import { Router } from 'express';
import { authUser } from '../middlewares/auth.middleware.js';
import {
    deleteChat,
    getChats,
    getMessages,
    sendMessage,
} from '../controllers/chat.controller.js';

const chatRouter = Router();

/**
 * @route /api/chats/message
 * @description sends a message from user to the ai
 * @access Private
 * @body {message,chat}
 */
chatRouter.post('/message', authUser, sendMessage);

/**
 * @route /api/chats/get-chats
 * @description get all chats of a user
 * @access Private
 * @body none
 */
chatRouter.get('/', authUser, getChats);

/**
 * @route /api/chats/get-messages/:chatId
 * @description get all in a chat of a user
 * @access Private
 * @body none
 */
chatRouter.get('/:chatId/messages', authUser, getMessages);

/**
 * @route /api/chats/delete-chat/:chatId
 * @description delete a chat of a user
 * @access Private
 * @body none
 */
chatRouter.delete('/delete/:chatId', authUser, deleteChat);

export default chatRouter;
