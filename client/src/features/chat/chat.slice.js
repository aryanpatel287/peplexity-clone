import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        loading: false,
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

        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
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
    setError,
    createNewChat,
    addNewMessage,
    setAllMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
