import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { streamAiReponse } from '../services/ai.service.js';
import { handleChatSend } from '../controllers/chat.socket.controller.js';

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_ORIGINS,
            credentials: true,
        },
    });

    // --- Auth middleware ---
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie || '';
            const token = cookieHeader
                .split('; ')
                .find((c) => c.startsWith('token='))
                ?.split('=')[1];

            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected: ' + socket.id);

        // --- Legacy handler (unchanged) ---
        // listenMessage(socket);

        // --- New streaming handler ---
        socket.on('chat:send', (data) => handleChatSend(socket, data));
    });

    console.log('Socket.io server is running');
}

export function getIO() {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
}

// Existing handler — not modified
function listenMessage(socket) {
    socket.on('message', async (msg) => {
        console.log(
            `[${new Date().toISOString()}] Received from ${socket.id}:`,
            msg,
        );
        const aiResponse = await streamAiReponse(msg);
        socket.emit('aiResponse', aiResponse);
    });
}
