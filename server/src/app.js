import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.route.js';
import morgan from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import appRouter from './routes/app.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
    cors({
        origin: process.env.CLIENT_ORIGINS,
        credentials: true,
    }),
);

const clientBuildPath = path.join(__dirname, '../', 'public');
console.log(path.join(__dirname, '../', 'public'));
app.use(express.static(clientBuildPath));

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);
app.use('/', appRouter);

export default app;
