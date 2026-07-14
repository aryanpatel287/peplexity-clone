import redis from '../../config/cache.js';

const KEY_PREFIX = 'active_stream:';
const TTL = 600; // 10 minutes auto-expiration

export async function startTracking(chatId) {
    const key = `${KEY_PREFIX}${chatId}`;
    await redis.hset(key, {
        status: 'active',
        thinking: '',
        toolCalls: '[]',
        updatedAt: Date.now()
    });
    await redis.expire(key, TTL);
}

export async function updateThinking(chatId, thinking) {
    const key = `${KEY_PREFIX}${chatId}`;
    await redis.hset(key, 'thinking', thinking);
    await redis.expire(key, TTL);
}

export async function addToolCall(chatId, toolName) {
    const key = `${KEY_PREFIX}${chatId}`;
    const existing = await redis.hget(key, 'toolCalls');
    let toolCalls = [];
    if (existing) {
        try {
            toolCalls = JSON.parse(existing);
        } catch (_) {}
    }
    if (!toolCalls.includes(toolName)) {
        toolCalls.push(toolName);
        await redis.hset(key, 'toolCalls', JSON.stringify(toolCalls));
    }
    await redis.expire(key, TTL);
}

export async function getActiveStream(chatId) {
    const key = `${KEY_PREFIX}${chatId}`;
    const data = await redis.hgetall(key);
    if (!data || Object.keys(data).length === 0) return null;
    return {
        status: data.status,
        thinking: data.thinking || '',
        toolCalls: JSON.parse(data.toolCalls || '[]'),
    };
}

export async function stopTracking(chatId) {
    const key = `${KEY_PREFIX}${chatId}`;
    await redis.del(key);
}
