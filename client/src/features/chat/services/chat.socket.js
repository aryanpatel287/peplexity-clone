import { io } from 'socket.io-client';
import {
    createNewChat,
    setCurrentChatId,
    addNewMessage,
    setThinking,
    setToolCall,
    finalizeMessage,
    removeLastMessage,
    setSending,
    setError,
} from '../chat.slice';

// --- Singleton socket instance ---
let socket = null;
let listenersRegistered = false;

export function initializeSocketConnection() {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_SOCKET_URL, {
        withCredentials: true,
    });

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
    });

    return socket;
}

export function getSocket() {
    return socket;
}

/**
 * Register all socket → Redux listeners once.
 */
export function registerSocketListeners(dispatch) {
    if (listenersRegistered) return;
    listenersRegistered = true;

    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        dispatch(setSending(false));
    });

    // New chat created server-side — add both message bubbles now
    socket.on('chat:chat_created', ({ chatId, title, userMessage }) => {
        dispatch(createNewChat({ chatId, title }));
        dispatch(setCurrentChatId(chatId));
        dispatch(addNewMessage({ chatId, content: userMessage, role: 'user' }));
        dispatch(addNewMessage({ chatId, content: '', role: 'ai' }));
    });

    // AI thinking/reasoning text — stored on the AI bubble
    socket.on('chat:thinking', ({ chatId, thinking }) => {
        dispatch(setThinking({ chatId, thinking }));
    });

    // Tool invocation — stored as array on the AI bubble
    socket.on('chat:tool_call', ({ chatId, toolName }) => {
        dispatch(setToolCall({ chatId, toolName }));
    });

    // Stream finished — stamp DB id + final text, then client animates
    socket.on('chat:done', ({ chatId, messageId, finalText }) => {
        dispatch(finalizeMessage({ chatId, messageId, finalText }));
        dispatch(setSending(false));
    });

    // Error — clean up
    socket.on('chat:error', ({ chatId, error }) => {
        dispatch(setError(error));
        dispatch(setSending(false));
        if (chatId) dispatch(removeLastMessage({ chatId }));
    });
}
