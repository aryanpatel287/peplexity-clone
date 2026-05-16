import { Redis } from 'ioredis';
import envConfig from './envconfig.js';

const redis = new Redis({
    host: envConfig.REDIS_HOST,
    port: envConfig.REDIS_PORT,
    password: envConfig.REDIS_PASSWORD,
});

redis.on('connect', () => {
    console.log('server is connected to redis');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

export default redis;
