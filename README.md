# Perplexity Clone

This repository contains a full-stack AI chat application split into two apps:

- client: React + Vite frontend for authentication and chat UI
- server: Express + Socket.IO backend for auth, chat persistence, AI orchestration, and file uploads

## API Collection and Quick Testing

- Postman collection: [Cohort2.0 Backend Collection](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
- Route-by-route request and response examples: [server/API_REQUEST_RESPONSE_EXAMPLES.md](server/API_REQUEST_RESPONSE_EXAMPLES.md)

## Architecture Overview

- Frontend and backend are developed as separate Node.js projects.
- Authentication is cookie-based using JWT.
- Chat supports both REST and real-time socket flows.
- Messages and chat history are stored in MongoDB.
- Logout token invalidation uses Redis.
- AI responses are generated through LangChain agents with external tool calling.

## Project Structure

```text
Perplexity/
  client/
  server/
```

## Tech Stack

### Client

- React 19
- Vite
- Redux Toolkit + React Redux
- React Router
- Axios
- Socket.IO Client
- Sass

### Server

- Node.js + Express 5
- MongoDB + Mongoose
- Socket.IO
- JWT + Cookie Parser
- Redis (ioredis)
- Nodemailer (OAuth2)
- Multer
- LangChain
- Tavily Search API
- ImageKit

## AI Models and Tools

The backend uses two LLM integrations through LangChain:

- gemma-4-31b-it via @langchain/google-genai
  - Used by the streaming agent for main chat responses.
- mistral-medium-latest via @langchain/mistralai
  - Used for standard non-stream generation and chat title generation.

Configured agent tools:

- emailTool
  - Sends email via Nodemailer OAuth2.
- searchInternetTool
  - Runs live web search through Tavily.
- getCurrentDateTime
  - Returns current date/time in Asia/Kolkata format and ISO.

## Core Data Models

MongoDB collections used by the backend:

- users
  - username, email, password, verified
- chats
  - user, title
- messages
  - chat, content, role (ai or user)
- files
  - uploaded file metadata and relation to message

## Local Setup

### 1) Clone and install

```bash
git clone <your-repo-url>
cd Perplexity

cd server
npm install

cd ../client
npm install
```

### 2) Configure environment variables

Create local env files:

- server/.env
- client/.env

See app-specific READMEs for the exact variable list.

### 3) Run apps

In one terminal:

```bash
cd server
npm run dev
```

In a second terminal:

```bash
cd client
npm run dev
```

Default local URLs:

- frontend: http://localhost:5173
- backend: http://localhost:3000

## API and Socket Summary

Base REST URLs:

- Auth: /api/auth
- Chats: /api/chats

Primary socket event flow:

- Client emits: chat:send
- Server emits: chat:chat_created, chat:thinking, chat:tool_call, chat:done, chat:error

## Notes

- Keep all secrets in env files and never commit them.
- Ensure CORS and socket origin values match your frontend URL.
- Upload endpoint currently accepts images and PDFs up to 2 MB per file.
