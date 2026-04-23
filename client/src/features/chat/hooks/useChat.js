import { initializeSocketConnection } from '../services/chat.socket';
import { useDispatch } from 'react-redux';
import {
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    createNewChat,
    addNewMessage,
    setAllMessages,
} from '../chat.slice';
import {
    sendMessage,
    getChats,
    getMessages,
    deleteChat,
} from '../services/chat.api';

export const useChat = () => {
    const dispatch = useDispatch();

    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true));

        console.log('useChat ChatId: ', chatId);

        const data = await sendMessage({ message, chatId });
        console.log(data);

        const { chat, aiMessage } = data;

        if (!chatId) {
            dispatch(
                createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }),
            );
        }

        dispatch(
            addNewMessage({
                chatId: chatId || chat._id,
                content: message,
                role: 'user',
            }),
        );

        dispatch(
            addNewMessage({
                chatId: chatId || chat._id,
                content: aiMessage.content,
                role: aiMessage.role,
            }),
        );

        dispatch(setCurrentChatId(chat._id));
        dispatch(setLoading(false));

        return chat._id;
    }

    async function handleGetChats() {
        dispatch(setLoading(true));

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

        dispatch(setLoading(false));
    }

    async function handleGetMessages({chatId}) {
        dispatch(setLoading(true));

        const data = await getMessages({ chatId });
        const { messages } = data;

        dispatch(setAllMessages({ chatId, messages }));

        dispatch(setLoading(false));
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleGetMessages,
    };
};
