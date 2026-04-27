# Perplexity Server

Backend API and socket server for the Perplexity clone application.

## API Collection and Examples

- Postman collection: [Cohort2.0 Backend Collection](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
- Detailed request and response examples: [API_REQUEST_RESPONSE_EXAMPLES.md](API_REQUEST_RESPONSE_EXAMPLES.md)

## What This Service Does

- User authentication and account lifecycle
  - register, verify email, login, logout
  - forgot password and update password
- Chat persistence
  - create chats, store messages, fetch history, delete chats
- AI orchestration
  - streaming responses over sockets
  - tool-calling through LangChain
- File upload support
  - image and PDF upload through ImageKit

## Stack

- Runtime: Node.js (ESM)
- Framework: Express 5
- Database: MongoDB with Mongoose
- Cache/blacklist: Redis (ioredis)
- Auth: JWT in cookies
- Realtime: Socket.IO
- Validation: express-validator, zod
- Uploads: multer + ImageKit
- Mail: Nodemailer OAuth2 (Gmail)
- AI orchestration: LangChain

## AI Models Used

The code configures two model clients:

- gemma-4-31b-it
  - Provider package: @langchain/google-genai
  - Used in streaming flow via geminiAgent.
- mistral-medium-latest
  - Provider package: @langchain/mistralai
  - Used for chat title generation and standard invoke flow.

## AI Tools Used

The agent can call the following tools:

- emailTool
  - Purpose: send email to a recipient.
  - Backed by: sendEmail in mail.service.js.
- searchInternetTool
  - Purpose: fetch latest web information.
  - Backed by: Tavily search API.
- getCurrentDateTime
  - Purpose: return current date/time payload.
  - Timezone: Asia/Kolkata.

## Data Models

- users
  - Fields: username, email, password, verified
- chats
  - Fields: user, title
- messages
  - Fields: chat, content, role
  - Virtual relation: files
- files
  - Stores upload metadata linked to messages

## API Routes

Base URL: /api

### Auth routes

- POST /auth/register
- GET /auth/verify-email?token=<token>
- POST /auth/login
- GET /auth/get-me
- POST /auth/resend-verify-email
- POST /auth/logout
- POST /auth/forgot-password
- PATCH /auth/update-password?token=<token>

### Chat routes

- POST /chats/message
- GET /chats
- GET /chats/:chatId/messages
- DELETE /chats/delete/:chatId
- POST /chats/uploads

Upload constraints:

- Allowed mimetypes: image/*, application/pdf
- Max size: 2 MB per file

## Socket Events

Client emits:

- chat:send

Server emits:

- chat:chat_created
- chat:thinking
- chat:tool_call
- chat:done
- chat:error

## Environment Variables

Create server/.env with values for:

- SERVER_PORT
- MONGO_URI
- JWT_SECRET
- CLIENT_ORIGINS

- REDIS_HOST
- REDIS_PORT
- REDIS_PASSWORD

- GOOGLE_USER
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REFRESH_TOKEN

- GEMINI_API_KEY
- MISTRAL_API_KEY

- TAVILY_API_KEY
- IMAGEKIT_PRIVATE_KEY

## Run Locally

```bash
npm install
npm run dev
```

Default port:

- http://localhost:3000

## Folder Map

```text
server/
  server.js
  src/
    app.js
    config/
    controllers/
    middlewares/
    models/
    routes/
    services/
    sockets/
    utils/
    validators/
```

## Important Notes

- Keep env secrets out of version control.
- Cookies and CORS require matching frontend origin.
- Redis is used to store logged-out tokens for blacklist behavior.
