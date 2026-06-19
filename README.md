# Perplexity Clone

This repository contains a full-stack AI chat application split into two apps:

- client: React + Vite frontend for authentication and chat UI
- server: Express + Socket.IO backend for auth, chat persistence, AI orchestration, and file uploads

### API Testing & Auto-Generated Documentation

We use automated integration tests with **Jest** and **Supertest** to verify all backend API endpoints and dynamically output live request and response examples.

- **Auto-Generated API Reference:** [server/API_REQUEST_RESPONSE_EXAMPLES.md](server/API_REQUEST_RESPONSE_EXAMPLES.md) (dynamically compiled when running the test suite)
- **Live Demo (deployed):** [https://perplexity.aryanpatel.in](https://perplexity.aryanpatel.in)
- **Postman Collection:** [Cohort2.0 Backend Collection (Live Link)](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
  - Alternatively, import the local [Perplexity_API_Collection.postman_collection.json](server/Perplexity_API_Collection.postman_collection.json) export file directly into Postman (pre-populated with request schemas and mock response examples!).

To execute the test suite and refresh the API examples documentation:
```bash
cd server
npm run test
```

## Key Features

- **Hybrid Authentication:** Stateful, secure HttpOnly cookie session management for both registered users (OTP & Magic Links verification via Gmail API) and guests. Includes guest session chat migration to user profiles upon registration/login.
- **Real-Time Stream Orchestration:** Two-way WebSockets (Socket.IO) mapping raw tokens, reasoning steps (`chat:thinking`), tool execution tracking (`chat:tool_call`), and completions.
- **Multimodal File Attachments:** Seamless uploading and processing of images and a wide range of document types (PDFs, PPTX, DOCX, TXT, CSV, JSON, Markdown, etc.) using ImageKit cloud storage.
- **Isolated Parsing & Fallbacks:** Bypasses heavy document parsing (LlamaParse) for images, direct text/markdown files, and spreadsheet data to preserve API credits and maximize response speeds. Individual file errors are gracefully caught so they don't break concurrent batch uploads.
- **Secure Chat-Scoped RAG:** Ingests document embeddings strictly isolated by `chatId`. Pinecone vector search and MongoDB chunk retrieval enforce ownership matching, eliminating cross-chat context leakage.
- **Dynamic LangChain Tools:** AI agent queries web resources (Tavily search), triggers transaction emails (Gmail API), checks live dates/times (Asia/Kolkata timezone), and retrieves scoped document fragments automatically.
- **Enhanced AI Output Rendering:** Render upgraded markup featuring custom physical keyboard keycaps (`<kbd>`), translucent highlights (`==highlight==`), polished details collapsibles, math equations resizing (KaTeX), and dynamic references smooth scrolling with pulse animation targeting.
- **Production-Grade Monitoring & Hardening:** Early vulnerability scanner protection middleware (rejection of `.php`, `.bak`, `.env` probes), Helmet CSP dynamic setup, and centralized Rollbar integration with strict PII/credential scrubbing.

## Architecture Overview

- **Monorepo-Style decouping:** Frontend (`/client`) and backend (`/server`) run as isolated, specialized applications.
- **RAG Ingestion:** Asynchronous document parser routes text files directly, runs PDFs and Office documents through LlamaCloud/LlamaParse, generates embeddings with Mistral AI, writes fragments into MongoDB, and indexes vectors inside Pinecone.
- **RAG Retrieval:** On tool invocation, the agent queries Pinecone under chat-scoped vector filters, maps indices back to MongoDB database chunks, and renders the synthesized context.
- **Production Packaging:** Production builds use a synchronization script to bundle the client app directly into the server's public folder for unified static delivery.

## Tech Stack

### Client

- **React 19** & **Vite**
- **Redux Toolkit** (State slices for `auth` and `chat`)
- **React Router v7**
- **Axios** (REST requests)
- **Socket.IO Client** (Real-time events)
- **Sass (SCSS)** (Modular layout and theme styling)
- **React Markdown** + `remark-gfm` + `rehype-raw` (custom components)
- **KaTeX** (Math equations rendering)
- **Rollbar Client** (Error logging and session replay)

### Server

- **Node.js** (ESM syntax) + **Express 5**
- **MongoDB** + **Mongoose 9** (Data persistence)
- **Redis (ioredis)** (Guest token limits, blacklist invalidation, OTP TTL)
- **Socket.IO** (Websocket server)
- **LangChain** (Agent routing and tool execution wrapper)
- **Google GenAI** (`gemma-4-31b-it` & `gemini-3.1-flash-lite`)
- **Mistral AI** (`mistral-medium-latest` & `mistral-embed`)
- **Pinecone** (Vector DB)
- **Llama Cloud** (LlamaParse document conversion)
- **Nodemailer** (Gmail OAuth2 SMTP integration)
- **Rollbar SDK** (Scrubbed production tracking)

## AI Models and Tools

The backend orchestrates models via LangChain:
- **`gemma-4-31b-it`**: Primary agent model generating streaming, real-time responses with tools.
- **`gemini-3.1-flash-lite`**: Used for structured summarization of documents and extracting metadata.
- **`mistral-medium-latest`**: Used for chat title generation and standard invoke utilities.
- **`mistral-embed`**: Generates text embeddings for vector storage indexing.

Active Agent Tools:
- **`emailTool`**: Sends emails to recipients via Gmail API.
- **`searchInternetTool`**: Queries Tavily Search engine for real-time web results.
- **`getCurrentDateTimeTool`**: Resolves current localized date/time.
- **`createContextRetrieverTool(chatId)`**: Generates context using chat-scoped vectors.

## Core Data Models

- **users**: Accounts storing username, email, hashed credentials, and Google OAuth ID references.
- **chats**: Active sessions bound to a user ID or a temporary cookie guest session token.
- **messages**: Prompt bubbles storing role (`user` / `ai`), timestamp metadata, and attachments.
- **files**: ImageKit descriptors, mimetype headers, parsing progress, and structured text summaries.
- **chunks**: Extracted document fragments referencing parent file and chat scopes.

## Local Setup

### 1) Clone and install

```bash
git clone <your-repo-url>
cd perplexity-clone

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2) Configure environment variables

Create and populate the local configuration files:
- `server/.env` (reference `server/.env.example` for details)
- `client/.env` (reference `client/.env.example` for details)

### 3) Run apps

Launch the development servers:

In terminal 1:
```bash
cd server
npm run dev
```

In terminal 2:
```bash
cd client
npm run dev
```

Default URLs:
- Frontend Client: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## API and Socket Summary

Base REST Endpoints:
- Authentication: `/api/auth`
- Conversation management: `/api/chats`

Primary socket event flow:
- Client emits: `chat:send`
- Server emits: `chat:chat_created`, `chat:thinking`, `chat:tool_call`, `chat:done`, `chat:error`

## Notes

- Keep secrets out of repository logs; use environmental configurations.
- Client CORS origin matches must specify the client server port (`5173` locally).
- Image and file uploads support batches up to **5 files** (max **2 MB** per file).
