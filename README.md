# Perplexity Clone

This repository contains a full-stack AI chat application split into two apps:

- client: React + Vite frontend for authentication and chat UI
- server: Express + Socket.IO backend for auth, chat persistence, AI orchestration, and file uploads

## API Collection and Quick Testing

- Live demo (deployed): [https://cohort2-0-backend-1-kphk.onrender.com](https://cohort2-0-backend-1-kphk.onrender.com)
- Postman collection: [Cohort2.0 Backend Collection](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
- Route-by-route request and response examples: [server/API_REQUEST_RESPONSE_EXAMPLES.md](server/API_REQUEST_RESPONSE_EXAMPLES.md)

## Key Features

- Cookie-based auth with email verification, password reset, and JWT blacklist via Redis
- Real-time chat with Socket.IO streaming (thinking, tool_call, done, error events)
- File attachments for images and PDFs with ImageKit storage
- RAG pipeline: PDF to markdown parsing, chunking, embeddings, and Pinecone vector search
- Tool calling: email, web search, current date/time, and document context retrieval
- Chat history, message files, and document chunks persisted in MongoDB

## Architecture Overview

- Frontend and backend are developed as separate Node.js projects.
- Chat supports both REST and real-time socket flows.
- Authentication is cookie-based using JWT.
- RAG ingestion uses Llama Cloud + markdown chunking, stores chunks in MongoDB, and indexes embeddings in Pinecone.

## Project Structure

```text
Perplexity/
  client/
    src/
      app/
      features/
        auth/
        chat/
        shared/
  server/
    server.js
    src/
      app.js
      config/
      controllers/
      middlewares/
      models/
      rag/
      routes/
      services/
        ai/
        mail/
      sockets/
      utils/
      validators/
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
- React Markdown + remark-gfm
- React Toastify
- Lucide React

### Server

- Node.js + Express 5 (ESM)
- MongoDB + Mongoose
- Redis (ioredis)
- Socket.IO
- JWT + Cookie Parser
- Multer + ImageKit
- LangChain + Google GenAI + Mistral AI
- Pinecone vector database
- Llama Cloud + UnPDF + pdf-parse for PDF parsing
- Nodemailer (OAuth2) + Mailjet
- Zod + express-validator

## AI Models and Tools

The backend uses LangChain with these models:

- gemma-4-31b-it via @langchain/google-genai (streaming responses)
- mistral-medium-latest via @langchain/mistralai (titles and non-stream generation)
- Mistral embeddings for document chunks

Configured agent tools:

- emailTool (Gmail API with Mailjet fallback)
- searchInternetTool (Tavily search)
- getCurrentDateTime
- contextRetrieverTool (Pinecone + MongoDB chunks)

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
- chunks
  - parsed document chunks for RAG

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
- Upload endpoint accepts images and PDFs (max 5 files, 2 MB per file).
