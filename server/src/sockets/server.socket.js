import { Server } from 'socket.io';

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_ORIGINS,
            credentials: true,
        },
    });

    console.log('Socket.io server is running');

    io.on('connection', (socket) => {
        console.log('A user connected: ' + socket.id);

        listenMessage(socket);
    });
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
}

function listenMessage(socket) {
    socket.on('message', async (msg) => {
        console.log(
            `[${new Date().toISOString()}] Received from ${socket.id}:`,
            msg,
        );
        const aiResponse = await streamAiChat(msg);
        socket.emit('aiResponse', aiResponse);
    });
}
