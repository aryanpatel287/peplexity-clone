import { jest } from '@jest/globals';

// 1. Mock ioredis
jest.unstable_mockModule('ioredis', () => {
    return {
        default: jest.fn().mockImplementation(() => {
            const store = new Map();
            return {
                get: jest.fn().mockImplementation(async (key) => store.get(key) || null),
                set: jest.fn().mockImplementation(async (key, value, mode, ttl) => {
                    store.set(key, value);
                    return 'OK';
                }),
                del: jest.fn().mockImplementation(async (key) => {
                    store.delete(key);
                    return 1;
                }),
                incr: jest.fn().mockImplementation(async (key) => {
                    const val = (Number(store.get(key)) || 0) + 1;
                    store.set(key, val.toString());
                    return val;
                }),
                decr: jest.fn().mockImplementation(async (key) => {
                    const val = (Number(store.get(key)) || 0) - 1;
                    store.set(key, val.toString());
                    return val;
                }),
                expire: jest.fn().mockResolvedValue(1),
                on: jest.fn(),
            };
        })
    };
});

// 2. Mock Mongoose models
const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindById = jest.fn();
jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: {
        findOne: mockUserFindOne,
        create: mockUserCreate,
        findById: mockUserFindById,
    }
}));

const mockChatCreate = jest.fn();
const mockChatFind = jest.fn();
const mockChatFindOne = jest.fn();
const mockChatFindOneAndDelete = jest.fn();
const mockChatUpdateMany = jest.fn();
jest.unstable_mockModule('../src/models/chat.model.js', () => ({
    default: {
        create: mockChatCreate,
        find: mockChatFind,
        findOne: mockChatFindOne,
        findOneAndDelete: mockChatFindOneAndDelete,
        updateMany: mockChatUpdateMany,
    }
}));

const mockMessageCreate = jest.fn();
const mockMessageFind = jest.fn();
const mockMessageDeleteMany = jest.fn();
jest.unstable_mockModule('../src/models/message.model.js', () => {
    const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockImplementation(function() { return Promise.resolve(this._results || []); }),
        _results: []
    };
    const findFn = jest.fn().mockReturnValue(mockQuery);
    return {
        default: {
            create: mockMessageCreate,
            find: findFn,
            deleteMany: mockMessageDeleteMany,
            _mockQuery: mockQuery,
            _findFn: findFn,
        }
    };
});

const mockFileCreate = jest.fn();
jest.unstable_mockModule('../src/models/file.model.js', () => ({
    default: {
        create: mockFileCreate,
    }
}));

// 3. Mock AI services
jest.unstable_mockModule('../src/services/ai/response.ai.service.js', () => ({
    generateChatTitle: jest.fn().mockResolvedValue('Mock Chat Title'),
    generateResponse: jest.fn().mockResolvedValue('This is a mock AI response from Mistral.'),
    streamAiReponse: jest.fn().mockResolvedValue('This is a mock AI response from Gemini stream.'),
    summariseFileWithAi: jest.fn().mockResolvedValue({
        title: 'Mock Document Summary',
        summary: 'Mock Summary Content',
        keywords: ['mock', 'test'],
        sections: ['Section 1'],
        suggestedSystemContext: 'Mock Context',
    }),
}));

// 4. Mock ImageKit service
jest.unstable_mockModule('../src/services/image.service.js', () => ({
    uploadMultipleImagesOnImageKit: jest.fn().mockResolvedValue([
        {
            fileId: 'mock_file_123',
            name: 'test.jpg',
            size: 1024,
            filePath: '/mock_file_123.jpg',
            url: 'https://ik.imagekit.io/mock/test.jpg',
            mimetype: 'image/jpeg',
        }
    ]),
    uploadImageOnImageKit: jest.fn().mockResolvedValue({
        fileId: 'mock_file_123',
        name: 'test.jpg',
        size: 1024,
        filePath: '/mock_file_123.jpg',
        url: 'https://ik.imagekit.io/mock/test.jpg',
        mimetype: 'image/jpeg',
    }),
}));

// 5. Mock mail service
jest.unstable_mockModule('../src/services/mail/mail.service.js', () => ({
    sendEmail: jest.fn().mockResolvedValue('Registration email sent successfully'),
}));

// Resolve ESM Dynamic Imports
const supertest = (await import('supertest')).default;
const app = (await import('../src/app.js')).default;
const jwt = (await import('jsonwebtoken')).default;
const envConfig = (await import('../src/config/envconfig.js')).default;
const redis = (await import('../src/config/cache.js')).default;
const userModel = (await import('../src/models/user.model.js')).default;
const chatModel = (await import('../src/models/chat.model.js')).default;
const messageModel = (await import('../src/models/message.model.js')).default;

const capturedApis = [];

function capture({ method, route, description, body = null, query = null, cookies = {}, status, responseBody }) {
    capturedApis.push({
        method,
        route,
        description,
        body,
        query,
        cookies,
        status,
        responseBody,
    });
}

describe('Perplexity API Endpoints & Contract Tests', () => {
    let userToken;
    let guestToken;
    const testEmail = 'john@example.com';
    const testUserId = '507f1f77bcf86cd799439011';
    const testChatId = '507f1f77bcf86cd799439012';

    beforeAll(() => {
        // Sign mock user and guest tokens for auth testing
        userToken = jwt.sign({ id: testUserId, email: testEmail }, envConfig.JWT_SECRET);
        guestToken = jwt.sign({ guestId: 'mock-guest-uuid', isGuest: true }, envConfig.JWT_SECRET);
    });

    beforeEach(async () => {
        // Clear token blacklisting in redis to prevent state pollution from logout test
        await redis.del(`perplexity-blacklist:${userToken}`);
    });

    afterAll(async () => {
        // Generate beautiful markdown api documentation as requested by user
        let markdown = `# Perplexity Clone API Documentation (Auto-Generated)

> This document contains live, verified request and response examples captured by running the integration test suite.
> Base URL: \`http://localhost:3000\`
> Generated on: ${new Date().toISOString().split('T')[0]}

---

## Table of Contents

`;

        // Render TOC
        capturedApis.forEach((api) => {
            const anchor = `${api.method.toLowerCase()}-${api.route.replace(/[\/:?=&]/g, '').toLowerCase()}`;
            markdown += `- [${api.method} ${api.route} — ${api.description}](#${anchor})\n`;
        });

        markdown += '\n---\n';

        // Render Endpoints Details
        capturedApis.forEach((api) => {
            const anchor = `${api.method.toLowerCase()}-${api.route.replace(/[\/:?=&]/g, '').toLowerCase()}`;
            markdown += `\n<a name="${anchor}"></a>\n## ${api.method} ${api.route}\n\n`;
            markdown += `**Description:** ${api.description}\n\n`;
            
            let authType = 'Public';
            if (api.cookies.token) {
                authType = 'Registered User Session Token (Cookie)';
            } else if (api.cookies.guest_token) {
                authType = 'Guest Session Token (Cookie)';
            }
            markdown += `**Authentication:** ${authType}\n\n`;

            if (api.query && Object.keys(api.query).length > 0) {
                markdown += `**Query Parameters:**\n\`\`\`json\n${JSON.stringify(api.query, null, 2)}\n\`\`\`\n\n`;
            }

            if (api.body && Object.keys(api.body).length > 0) {
                markdown += `**Request Body:**\n\`\`\`json\n${JSON.stringify(api.body, null, 2)}\n\`\`\`\n\n`;
            }

            markdown += `**Response Status:** \`${api.status}\`\n\n`;
            markdown += `**Response Body:**\n\`\`\`json\n${JSON.stringify(api.responseBody, null, 2)}\n\`\`\`\n\n`;

            // Add code examples
            markdown += `### Example Request (cURL)\n`;
            markdown += `\`\`\`bash\ncurl -X ${api.method} http://localhost:3000${api.route}`;
            if (api.query) {
                const q = new URLSearchParams(api.query).toString();
                if (q) markdown += `?${q}`;
            }
            if (api.cookies.token) {
                markdown += ` \\\n  -H "Cookie: token=<your-jwt-token>"`;
            } else if (api.cookies.guest_token) {
                markdown += ` \\\n  -H "Cookie: guest_token=<your-guest-token>"`;
            }
            if (api.body) {
                markdown += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(api.body)}'`;
            }
            markdown += `\n\`\`\`\n\n`;

            markdown += `### Example Request (JavaScript Fetch)\n`;
            markdown += `\`\`\`javascript\nconst response = await fetch('http://localhost:3000${api.route}${api.query ? '?' + new URLSearchParams(api.query).toString() : ''}', {\n`;
            markdown += `  method: '${api.method}',\n`;
            markdown += `  headers: {\n`;
            if (api.body) {
                markdown += `    'Content-Type': 'application/json',\n`;
            }
            if (api.cookies.token || api.cookies.guest_token) {
                markdown += `    'Credentials': 'include',\n`;
            }
            markdown += `  },\n`;
            if (api.body) {
                markdown += `  body: JSON.stringify(${JSON.stringify(api.body, null, 2)}),\n`;
            }
            markdown += `});\nconst data = await response.json();\nconsole.log(data);\n\`\`\`\n`;
            markdown += `\n---\n`;
        });

        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const serverRoot = path.join(__dirname, '..');
        fs.writeFileSync(path.join(serverRoot, 'API_REQUEST_RESPONSE_EXAMPLES.md'), markdown);
        console.log('Automated API Documentation written successfully!');
    });

    it('POST /api/auth/send-signup-email - Success', async () => {
        const body = { email: testEmail };
        const res = await supertest(app)
            .post('/api/auth/send-signup-email')
            .send(body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'POST',
            route: '/api/auth/send-signup-email',
            description: 'Send magic signup link and OTP to user email',
            body,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('POST /api/auth/send-signup-email - Validation Error', async () => {
        const body = { email: 'invalid-email' };
        const res = await supertest(app)
            .post('/api/auth/send-signup-email')
            .send(body);

        expect(res.status).toBe(400);

        capture({
            method: 'POST',
            route: '/api/auth/send-signup-email',
            description: 'Fails validation if email parameter is invalid',
            body,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('POST /api/auth/verify-signup-email - Success with correct OTP', async () => {
        // Setup cache mock to return verify success
        mockUserFindOne.mockResolvedValue({
            _id: testUserId,
            email: testEmail,
            username: 'john',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Seed OTP cache store
        const cacheStore = (await import('../src/config/cache.js')).default;
        const testOtp = '123456';
        const sessionPayload = {
            otp: testOtp,
            otpHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // hash for 123456
            attempts: 0,
            resendCount: 0,
            cooldownExpiresAt: Date.now() + 60000,
            createdAt: Date.now(),
        };
        await cacheStore.set('sign-up:john@example.com', JSON.stringify(sessionPayload));

        const body = { email: testEmail, otp: testOtp };
        const res = await supertest(app)
            .post('/api/auth/verify-signup-email')
            .send(body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'POST',
            route: '/api/auth/verify-signup-email',
            description: 'Verify signup OTP and login registered user',
            body,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('POST /api/auth/guest-session - Success', async () => {
        const res = await supertest(app)
            .post('/api/auth/guest-session');

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        capture({
            method: 'POST',
            route: '/api/auth/guest-session',
            description: 'Create a new guest session cookie if none exists',
            status: res.status,
            responseBody: res.body,
        });
    });

    it('GET /api/auth/get-me - Success with User Cookie', async () => {
        mockUserFindById.mockResolvedValue({
            _id: testUserId,
            email: testEmail,
            username: 'john',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const cookies = { token: userToken };
        const res = await supertest(app)
            .get('/api/auth/get-me')
            .set('Cookie', `token=${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'GET',
            route: '/api/auth/get-me',
            description: 'Get logged-in user profile details using authentication token cookie',
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('POST /api/auth/claim-guest-chats - Success', async () => {
        mockChatUpdateMany.mockResolvedValue({ modifiedCount: 3 });

        const cookies = { token: userToken, guest_token: guestToken };
        const res = await supertest(app)
            .post('/api/auth/claim-guest-chats')
            .set('Cookie', `token=${userToken}; guest_token=${guestToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'POST',
            route: '/api/auth/claim-guest-chats',
            description: 'Transfer chats created during guest session to logged-in user account',
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('POST /api/auth/logout - Success', async () => {
        const cookies = { token: userToken };
        const res = await supertest(app)
            .post('/api/auth/logout')
            .set('Cookie', `token=${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'POST',
            route: '/api/auth/logout',
            description: 'Blacklist session token and clear authentication cookie',
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('GET /api/chats - Success', async () => {
        mockChatFind.mockResolvedValue([
            { _id: testChatId, title: 'What is Perplexity AI?', createdAt: new Date().toISOString() }
        ]);

        const cookies = { token: userToken };
        const res = await supertest(app)
            .get('/api/chats')
            .set('Cookie', `token=${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'GET',
            route: '/api/chats',
            description: 'Fetch all chat histories created by active user/guest',
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('GET /api/chats/:chatId/messages - Success', async () => {
        mockChatFindOne.mockResolvedValue({ _id: testChatId });
        
        // Mock mongoose query builder populate chain
        const query = messageModel._mockQuery;
        query._results = [
            {
                _id: '507f1f77bcf86cd799439013',
                chat: testChatId,
                role: 'user',
                content: 'Hello AI',
                files: [],
                createdAt: new Date().toISOString(),
            },
            {
                _id: '507f1f77bcf86cd799439014',
                chat: testChatId,
                role: 'ai',
                content: 'This is a mock AI response from Mistral.',
                files: [],
                createdAt: new Date().toISOString(),
            }
        ];

        const cookies = { token: userToken };
        const res = await supertest(app)
            .get(`/api/chats/${testChatId}/messages`)
            .set('Cookie', `token=${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'GET',
            route: `/api/chats/${testChatId}/messages`,
            description: 'Fetch chat messages for a specific conversation session',
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('POST /api/chats/message - Success (New Chat)', async () => {
        mockChatCreate.mockResolvedValue({ _id: testChatId, title: 'Mock Chat Title' });
        mockMessageCreate.mockResolvedValueOnce({
            _id: '507f1f77bcf86cd799439013',
            chat: testChatId,
            role: 'user',
            content: 'Hello AI',
            createdAt: new Date().toISOString(),
        }).mockResolvedValueOnce({
            _id: '507f1f77bcf86cd799439014',
            chat: testChatId,
            role: 'ai',
            content: 'This is a mock AI response from Mistral.',
            createdAt: new Date().toISOString(),
        });
        mockMessageFind.mockResolvedValue([
            { role: 'user', content: 'Hello AI' }
        ]);

        const body = { message: 'Hello AI', chat: null };
        const cookies = { token: userToken };
        const res = await supertest(app)
            .post('/api/chats/message')
            .set('Cookie', `token=${userToken}`)
            .send(body);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        capture({
            method: 'POST',
            route: '/api/chats/message',
            description: 'Submit user message to generate synchronous AI agent response',
            body,
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('DELETE /api/chats/delete/:chatId - Success', async () => {
        mockChatFindOneAndDelete.mockResolvedValue({ _id: testChatId });
        mockMessageDeleteMany.mockResolvedValue({ deletedCount: 2 });

        const cookies = { token: userToken };
        const res = await supertest(app)
            .delete(`/api/chats/delete/${testChatId}`)
            .set('Cookie', `token=${userToken}`);

        expect(res.status).toBe(200);

        capture({
            method: 'DELETE',
            route: `/api/chats/delete/${testChatId}`,
            description: 'Delete conversation thread and all corresponding messages',
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });

    it('POST /api/chats/uploads - Success with Files', async () => {
        const cookies = { token: userToken };
        const res = await supertest(app)
            .post('/api/chats/uploads')
            .set('Cookie', `token=${userToken}`)
            .attach('files', Buffer.from('mock file binary content'), 'image.jpg');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        capture({
            method: 'POST',
            route: '/api/chats/uploads',
            description: 'Upload local files (images or documents) onto storage',
            cookies,
            status: res.status,
            responseBody: res.body,
        });
    });
});
