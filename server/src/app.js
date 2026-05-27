import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.route.js';
import morgan from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import appRouter from './routes/app.routes.js';
import envConfig from './config/envconfig.js';
import helmet from 'helmet';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(
    cors({
        origin(origin, callback) {
            callback(null, envConfig.isAllowedClientOrigin(origin));
        },
        credentials: true,
    }),
);

// Initialize Passport for Google OAuth
app.use(passport.initialize());

passport.use(
    new GoogleStrategy(
        {
            clientID: envConfig.GOOGLE_CLIENT_ID,
            clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            //Here we can handle the user profile returned by Google and create or find a user in our database
            //For simplicity, we'll just return the profile
            return done(null, profile);
        },
    ),
);

const clientBuildPath = path.join(__dirname, '../', 'public');
app.use(express.static(clientBuildPath));

app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);
app.use('/', appRouter);

export default app;
