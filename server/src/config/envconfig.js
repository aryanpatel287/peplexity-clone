import { config } from 'dotenv';
config();

if (!process.env.MONGO_URI) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: MONGO_URI');
}

if (!process.env.JWT_SECRET) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: JWT_SECRET');
}

if (!process.env.CLIENT_ORIGINS) {
    throw new Error('MISSING ENVIRONMENT VARIABLE: CLIENT_ORIGINS');
}

if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN ||
    !process.env.GOOGLE_SENDER_EMAIL
) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR GOOGLE API');
}

if (
    !process.env.REDIS_HOST ||
    !process.env.REDIS_PORT ||
    !process.env.REDIS_PASSWORD
) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR REDIS');
}

if (
    !process.env.MJ_APIKEY_PUBLIC ||
    !process.env.MJ_APIKEY_PRIVATE ||
    !process.env.MJ_USER
) {
    throw new Error('MISSING ENVIRONMENT VARIABLES FOR MAILJET API');
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

const envConfig = {
    //  Server configuration keys
    SERVER_PORT: process.env.SERVER_PORT || 3000,
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    CLIENT_ORIGINS: process.env.CLIENT_ORIGINS,

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

    //  Mailjet Api keys
    MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
    MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
    MJ_USER: process.env.MJ_USER,

    //  Ai models keys
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,

    //  Ai Tools Keys
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    LLAMA_CLOUD_API_KEY: process.env.LLAMA_CLOUD_API_KEY,
};

export default envConfig;
