import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { capitalize } from '../../shared/utils/format';
import { SOCKET_URL } from '../../../app/runtime.config';
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
    setGuestLimitReached,
} from '../chat.slice';

// --- Singleton socket instance ---
let socket = null;
let listenersRegistered = false;
let currentSessionType = null;
let currentChatIdForSocket = null;

export function initializeSocketConnection(sessionType = 'user') {
    if (socket && currentSessionType === sessionType) return socket;

    if (socket && currentSessionType !== sessionType) {
        socket.disconnect();
        socket = null;
        listenersRegistered = false;
    }

    socket = io(SOCKET_URL, {
        withCredentials: true,
    });
    currentSessionType = sessionType;

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server:', socket.id);
        if (currentChatIdForSocket) {
            socket.emit('chat:join', { chatId: currentChatIdForSocket });
            console.log(`Auto-joined active chat room on connect: ${currentChatIdForSocket}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
    });

    return socket;
}

export function getSocket() {
    return socket;
}

export function joinChatRoom(chatId) {
    if (socket && socket.connected) {
        socket.emit('chat:join', { chatId });
        console.log(`Sent chat:join for room ${chatId}`);
    }
}

export function leaveChatRoom(chatId) {
    if (socket && socket.connected) {
        socket.emit('chat:leave', { chatId });
        console.log(`Sent chat:leave for room ${chatId}`);
    }
}

export function setCurrentChatIdForSocket(chatId) {
    currentChatIdForSocket = chatId;
    joinChatRoom(chatId);
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
    socket.on(
        'chat:chat_created',
        ({ chatId, title, userMessage, uploadedFiles }) => {
        dispatch(createNewChat({ chatId, title }));
        dispatch(setCurrentChatId(chatId));
        setCurrentChatIdForSocket(chatId);
        dispatch(
            addNewMessage({
                chatId,
                content: userMessage,
                role: 'user',
                files: uploadedFiles,
            }),
        );
        dispatch(addNewMessage({ chatId, content: '', role: 'ai' }));
        },
    );

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
    socket.on('chat:error', ({ chatId, error, code }) => {
        const msg = capitalize(error);
        dispatch(setError(msg));
        dispatch(setSending(false));

        if (code === 'AUTH_REQUIRED') {
            dispatch(setGuestLimitReached({ reached: true, chatId }));
            toast.info('Create an account to continue');
            if (chatId) {
                dispatch(removeLastMessage({ chatId }));
                dispatch(removeLastMessage({ chatId }));
            }
            return;
        }

        toast.error(msg);
        if (chatId) dispatch(removeLastMessage({ chatId }));
    });
}
