import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { streamAiReponse } from '../services/ai/response.ai.service.js';
import { handleChatSend } from '../controllers/chat.socket.controller.js';
import envConfig from '../config/envconfig.js';

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: envConfig.CLIENT_ORIGINS,
            credentials: true,
        },
        pingTimeout: 120000, // 2 minutes
        pingInterval: 25000, // 25 seconds
    });

    // --- Auth middleware ---
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie || '';
            const cookies = cookieHeader
                .split('; ')
                .reduce((acc, item) => {
                    const [key, ...rest] = item.split('=');
                    if (!key) return acc;
                    acc[key] = rest.join('=');
                    return acc;
                }, {});

            const token = cookies.token || cookies.guest_token;

            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, envConfig.JWT_SECRET);
            if (decoded?.isGuest) {
                socket.user = {
                    isGuest: true,
                    guestId: decoded.guestId,
                };
            } else {
                socket.user = {
                    ...decoded,
                    isGuest: false,
                };
            }
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
