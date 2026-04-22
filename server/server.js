import 'dotenv/config';
import app from './src/app.js';
import http from 'http';
import connectToDb from './src/config/database.js';
import { initSocket } from './src/sockets/server.socket.js';

const PORT = process.env.SERVER_PORT || 3000;

const httpServer = http.createServer(app);

initSocket(httpServer);

connectToDb().catch((err) => {
    console.error('MongoDB connection failed: ', err);
    process.exit(1);
});

httpServer.listen(PORT, () => {
    console.log('server is running on port ', process.env.SERVER_PORT);
});
