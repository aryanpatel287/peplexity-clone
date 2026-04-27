import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        loading: false,
        isSending: false,
        error: null,
        isUploading: false,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload;
            state.chats[chatId] = {
                _id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toDateString(),
                messagesLoaded: true,
            };
        },

        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload;
            state.chats[chatId].messages.push({ content, role });
        },

        setAllMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            state.chats[chatId].messages = messages;
            state.chats[chatId].messagesLoaded = true;
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

        setUploadFiles: (state, action) => {
            const { files, chatId } = action.payload;
            state.chats[chatId].uploads = files;
        },
        setisUploading: (state, action) => {
            state.isUploading = action.payload;
        },

        // Sets AI reasoning/thinking text on the last (streaming) AI message
        setThinking: (state, action) => {
            const { chatId, thinking } = action.payload;
            const msgs = state.chats[chatId]?.messages;
            if (!msgs?.length) return;
            msgs[msgs.length - 1].thinking = thinking;
        },

        // Appends a tool name to the last (streaming) AI message
        setToolCall: (state, action) => {
            const { chatId, toolName } = action.payload;
            const msgs = state.chats[chatId]?.messages;
            if (!msgs?.length) return;
            const last = msgs[msgs.length - 1];
            if (!last.toolCalls) last.toolCalls = [];
            last.toolCalls.push(toolName);
        },

        setError: (state, action) => {
            state.error = action.payload;
        },

        // --- Socket streaming reducers ---

        // streamAiReponse gives FULL accumulated text each time → REPLACE not append
        setStreamingChunk: (state, action) => {
            const { chatId, chunk } = action.payload;
            const msgs = state.chats[chatId]?.messages;
            if (!msgs?.length) return;
            msgs[msgs.length - 1].content = chunk;
        },

        // Stamp the DB _id and authoritative final text on the AI bubble
        finalizeMessage: (state, action) => {
            const { chatId, messageId, finalText } = action.payload;
            const msgs = state.chats[chatId]?.messages;
            if (!msgs?.length) return;
            const last = msgs[msgs.length - 1];
            last._id = messageId;
            last.content = finalText;
        },

        // Remove the empty AI bubble on stream error
        removeLastMessage: (state, action) => {
            const { chatId } = action.payload;
            state.chats[chatId]?.messages.pop();
        },
    },
});

export const {
    setChats,
    setCurrentChatId,
    setLoading,
    setSending,
    setUploadFiles,
    setisUploading,
    setThinking,
    setToolCall,
    setError,
    setAllMessages,
    createNewChat,
    addNewMessage,
    setDeleteChat,
    setStreamingChunk,
    finalizeMessage,
    removeLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
