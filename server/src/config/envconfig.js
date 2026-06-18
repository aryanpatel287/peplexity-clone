import { config } from 'dotenv';
config();

function normalizeOrigin(origin = '') {
    return origin.trim().replace(/\/$/, '');
}

const clientOrigins = (process.env.CLIENT_ORIGINS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

const isProduction = process.env.NODE_ENV == 'production';

if (!process.env.MONGO_URI) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: MONGO_URI');
}

if (!process.env.JWT_SECRET) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: JWT_SECRET');
}

if (!process.env.CLIENT_ORIGINS) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: CLIENT_ORIGINS');
}

if (!clientOrigins.length) {
    throw new Error('MISSING VALID CLIENT_ORIGINS VALUES');
}

if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN ||
    !process.env.GOOGLE_SENDER_EMAIL
) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR GOOGLE API');
}

if (!process.env.RESEND_API_KEY || !process.env.RESEND_USER) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR RESEND API');
}

if (
    !process.env.REDIS_HOST ||
    !process.env.REDIS_PORT ||
    !process.env.REDIS_PASSWORD
) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR REDIS');
}

if (!process.env.GEMINI_API_KEY || !process.env.MISTRAL_API_KEY) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR AI MODELS');
}

if (
    !process.env.TAVILY_API_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.LLAMA_CLOUD_API_KEY
) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR AI TOOLS');
}

if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR PINECONE');
}

if (isProduction && !process.env.ROLLBAR_ACCESS_TOKEN) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: ROLLBAR_ACCESS_TOKEN');
}

const envConfig = {
    //  Server configuration keys
    SERVER_PORT: process.env.SERVER_PORT || 3000,
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    CLIENT_ORIGINS: clientOrigins,
    CLIENT_ORIGIN: clientOrigins[0],
    IS_PRODUCTION: isProduction,
    AUTH_COOKIE_OPTIONS: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    },

    NODE_ENV: process.env.NODE_ENV || 'development',

    //  JWT configuration keys
    JWT_SECRET: process.env.JWT_SECRET,

    //  Database configuration keys
    MONGO_URI: process.env.MONGO_URI,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_INDEX: process.env.PINECONE_INDEX,

    //  Redis configuration keys
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    //  Google Api keys
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_SENDER_EMAIL: process.env.GOOGLE_SENDER_EMAIL,

    //  Resend Api keys
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_USER: process.env.RESEND_USER,

    //  Ai models keys
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,

    //  Ai Tools Keys
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    LLAMA_CLOUD_API_KEY: process.env.LLAMA_CLOUD_API_KEY,

    // Rollbar keys
    ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
    ROLLBAR_ENVIRONMENT: process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV || 'development',

    isAllowedClientOrigin(origin) {
        if (!origin) return true;
        return clientOrigins.includes(normalizeOrigin(origin));
    },
};

export default envConfig;
