import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.route.js';
import morgan from 'morgan';

const app = express();
console.log(new Date().toISOString().split('T')[0]);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
    cors({
        origin: process.env.CLIENT_ORIGINS,
        credentials: true,
    }),
);

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);

export default app;
