import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        loading: false,
        isSending: false,
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload;
            state.chats[chatId] = {
                _id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toDateString(),
            };
        },

        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload;
            state.chats[chatId].messages.push({ content, role });
        },

        setAllMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            state.chats[chatId].messages = messages;
        },

        setChats: (state, action) => {
            state.chats = action.payload;
        },

        setDeleteChat: (state, action) => {
            const { chatId } = action.payload;
            delete state.chats[chatId];
        },

        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setSending: (state, action) => {
            state.isSending = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setChats,
    setCurrentChatId,
    setLoading,
    setSending,
    setError,
    setAllMessages,
    createNewChat,
    addNewMessage,
    setDeleteChat,
} = chatSlice.actions;

export default chatSlice.reducer;
