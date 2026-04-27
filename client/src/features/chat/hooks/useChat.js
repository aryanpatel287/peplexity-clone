import {
    initializeSocketConnection,
    getSocket,
    registerSocketListeners,
} from '../services/chat.socket';
import { useDispatch } from 'react-redux';
import {
    setChats,
    setCurrentChatId,
    setLoading,
    setSending,
    setError,
    createNewChat,
    addNewMessage,
    setAllMessages,
    setDeleteChat,
    setisUploading,
} from '../chat.slice';
import {
    sendMessage,
    getChats,
    getMessages,
    deleteChat,
    uploadFiles,
} from '../services/chat.api';

export const useChat = () => {
    const dispatch = useDispatch();

    async function handleSendMessage({ message, chatId }) {
        dispatch(setSending(true));
        try {
            const data = await sendMessage({ message, chatId });
            const { chat, aiMessage } = data;

            if (!chatId) {
                dispatch(createNewChat({ chatId: chat._id, title: chat.title }));
            }

            dispatch(addNewMessage({ chatId: chatId || chat._id, content: message, role: 'user' }));
            dispatch(addNewMessage({ chatId: chatId || chat._id, content: aiMessage.content, role: aiMessage.role }));
            dispatch(setCurrentChatId(chat._id));

            return chat._id;
        } catch (err) {
            dispatch(setError(err?.message ?? 'Failed to send message'));
        } finally {
            dispatch(setSending(false));
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true));
        try {
            const data = await getChats();
            const { chats } = data;

            dispatch(
                setChats(
                    chats.reduce((acc, chat) => {
                        acc[chat._id] = {
                            _id: chat._id,
                            title: chat.title,
                            messages: [],
                            lastUpdated: chat.updatedAt,
                        };
                        return acc;
                    }, {}),
                ),
            );
        } catch (err) {
            dispatch(setError(err?.message ?? 'Failed to load chats'));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMessages({ chatId }) {
        dispatch(setLoading(true));
        try {
            const data = await getMessages({ chatId });
            const { messages } = data;
            dispatch(setAllMessages({ chatId, messages }));
        } catch (err) {
            dispatch(setError(err?.message ?? 'Failed to load messages'));
        } finally {
            dispatch(setLoading(false));
        }
    }

    function handleCurrentChatId(chatId) {
        dispatch(setCurrentChatId(chatId));
    }

    async function handleDeleteChat({ chatId }) {
        dispatch(setLoading(true));
        try {
            await deleteChat({ chatId });
            dispatch(setDeleteChat({ chatId }));
        } catch (err) {
            dispatch(setError(err?.message ?? 'Failed to delete chat'));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUploadFiles({ files }) {
        dispatch(setisUploading(true));
        try {
            const data = await uploadFiles({ files });
            return data.uploadedFiles;
        } catch (err) {
            dispatch(setError(err?.message ?? 'File upload failed'));
            return null;
        } finally {
            dispatch(setisUploading(false));
        }
    }

    function handleSendMessageSocket({ message, chatId, uploadedFiles }) {
        const socket = getSocket();
        if (!socket?.connected) return;

        dispatch(setSending(true));

        if (chatId) {
            dispatch(addNewMessage({ chatId, content: message, role: 'user' }));
            dispatch(addNewMessage({ chatId, content: '', role: 'ai' }));
        }

        socket.emit('chat:send', { message, chatId, uploadedFiles });
    }

    return {
        initializeSocketConnection,
        registerSocketListeners,
        handleSendMessage,
        handleSendMessageSocket,
        handleGetChats,
        handleGetMessages,
        handleDeleteChat,
        handleCurrentChatId,
        handleUploadFiles,
    };
};
