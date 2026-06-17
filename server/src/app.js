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
import { blockSuspiciousRequests } from './middlewares/app.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// 1. Logger
app.use(morgan('dev'));

// 2. Security Headers (with custom CSP to allow API/WebSocket domains & CDNs)
const wsUrl = envConfig.SERVER_URL.replace(/^http/, 'ws');
const connectSources = [
    "'self'",
    envConfig.SERVER_URL,
    wsUrl,
    ...(envConfig.CLIENT_ORIGINS || []),
];

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'connect-src': connectSources,
                'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
                'font-src': ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
                'img-src': ["'self'", 'data:', 'https://ik.imagekit.io'],
            },
        },
    }),
);

// 3. CORS configuration
app.use(
    cors({
        origin(origin, callback) {
            callback(null, envConfig.isAllowedClientOrigin(origin));
        },
        credentials: true,
    }),
);

// 4. Block malicious scanners early (before parsing body/cookies or running passport/static logic)
app.use(blockSuspiciousRequests);

// 5. Body and Cookie Parsers
app.use(express.json());
app.use(cookieParser());

// 6. Passport Initialization for Google OAuth
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

// 7. Static Client Assets
const clientBuildPath = path.join(__dirname, '../', 'public');
app.use(express.static(clientBuildPath));

// 8. API & SPA Routing
app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);
app.use('/', appRouter);

export default app;
