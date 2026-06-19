<!-- prettier-ignore -->
<div align="center">

<h1>Perplexity Clone - Server</h1>

_The Node.js & Express 5 backend engine for the Perplexity clone, orchestrating Google Gemini/Mistral AI agents, secure Pinecone RAG, and Gmail API integration._

[![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express version](https://img.shields.io/badge/Express-5.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB version](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![Redis version](https://img.shields.io/badge/Redis-ioredis_5-FF4438?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Pinecone version](https://img.shields.io/badge/Pinecone-7.x-2C5E8A?style=flat-square)](https://pinecone.io)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)

⭐ If you like this project, star it on GitHub — it helps a lot!

[Features](#features) • [Tech Stack](#tech-stack) • [Folder Structure](#folder-structure) • [AI Architecture](#ai-architecture) • [RAG Ingestion & Retrieval](#rag-ingestion--retrieval) • [API & Socket Reference](#api--socket-reference) • [Environment Variables](#environment-variables) • [Testing & Local Setup](#testing--local-setup)

</div>

## Features

- **Authentication & Claims Migration**: Stateful HTTP cookie session manager (JWT). Delivers alphanumeric OTP codes and verification Magic Links using Gmail OAuth2 API. Automatically transfers guest session chats to full user profiles on verification.
- **Bi-directional Stream Controller**: WebSocket handler (Socket.IO) mapping raw tokens, thought sequences (`chat:thinking`), invoked LangChain agent tools (`chat:tool_call`), and rates-limit checks.
- **Isolated Parsing & Direct Ingest**: Integrates safe processing loops for multi-file attachments (images, PDFs, PowerPoint, Word, TXT, CSV, JSON, Markdown). Isolates errors to prevent a single file failure from aborting batch uploads. Bypasses LlamaParse for images and text-based formats to save API costs.
- **Secure Chat-Scoped RAG**: Ingests document chunk vectors mapped to the active `chatId`. Employs Pinecone vector query filters and MongoDB chunk lookups to guarantee chats retrieve only their own documents.
- **Centralized Telemetry & PII Stripping**: Rollbar logging system configured to strip authorization tokens, user passwords, cookie headers, and anonymize request IP addresses.
- **Security Hardening Filters**: Mounts early bot protection filters rejecting suspicious directory probes (`.env`, `.php`, `.bak`) with clean 404 responses before loading heavy server modules.

---

## Tech Stack

- **Runtime**: Node.js (ESM import syntax)
- **Framework**: Express 5 (routing, controllers, error handlers)
- **Database Layer**: MongoDB + Mongoose 9 (Schemas, compound indexing, virtual relations)
- **Vector DB**: Pinecone Client 7
- **Cache & TTL Store**: Redis (ioredis 5) for blacklisting, OTP lifecycle, and guest rate counters
- **Security Filters**: Helmet (dynamic CSP), CORS, bcrypt
- **AI Agent Wrapper**: LangChain 1.x
- **Services**: Tavily (search), ImageKit (file upload), LlamaCloud (PDF conversion), Gmail API (SMTP mailing)

---

## Folder Structure

```text
server/
├── tests/                    # Integration Test Suite
│   └── api.test.js           # Jest contract tests & schema documentation compiler
├── src/
│   ├── app.js                # Express app setup, routing, and middlewares
│   ├── config/               # Database, Redis, and envconfig setups
│   ├── controllers/          # Route handlers & socket streaming controls
│   ├── middlewares/          # Auth filters, upload helpers, and security monitors
│   ├── models/               # Mongoose DB Schemas (User, Chat, Message, File, Chunk)
│   ├── rag/                  # RAG flow (LlamaParse, Chunking, Ingestion, Retrieval)
│   ├── routes/               # Express REST routers
│   ├── services/             # Integrations (AI agents/embeddings, Gmail API, ImageKit, Tavily)
│   ├── sockets/              # Socket.IO WebSocket initialization
│   ├── utils/                # Response structure helpers, OTP caches, email templates
│   └── validators/           # express-validator payload guards
└── server.js                 # App Entry Point (bootstraps HTTP/WS and Mongo connections)
```

---

## AI Architecture

Orchestrated via LangChain agents using request-scoped factory closures (`getGeminiAgent(chatId)` / `getMistralAgent(chatId)`):

| LLM Model                   | Provider          | Primary Role                                                                              |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| **`gemma-4-31b-it`**        | Google Gemini API | Core reasoning agent with tool-calling and token streaming capabilities.                  |
| **`gemini-3.1-flash-lite`** | Google Gemini API | Specialized fast parser for metadata tagging, file summary extraction, and index caching. |
| **`mistral-medium-latest`** | Mistral AI        | Secondary model generating user-friendly conversation titles from prompts.                |
| **`mistral-embed`**         | Mistral AI        | Text embedder mapping chunks and search queries to multi-dimensional vectors.             |

### Configured Agent Tools

- **`searchInternetTool`** - Tavily Web Search API integration extracting top-5 search results.
- **`emailTool`** - Formats and sends transaction-based emails using Gmail API.
- **`getCurrentDateTime`** - Resolves active timestamp in localized `Asia/Kolkata` (IST) timezone.
- **`createContextRetrieverTool(chatId)`** - Custom vector search tool pulling scoped context.

---

## RAG Ingestion & Retrieval

### 1. Document Ingestion Flow

```
PDF/Office Docs ──► LlamaParse ──► Page Margins Parser ──► Recursive Splitter (700 chars / 120 overlap)
                                                                 │
  Pinecone Vector DB (Indexed by chat ID) ◄── Mistral Embed ◄────┴────► MongoDB Chunks Collection
```

### 2. Context Retrieval Flow

```
User Query ──► Mistral Embed ──► Pinecone Vector Search (filtered by chatId) ──► Mongo Chunk Lookup ──► AI State Context
```

---

## API & Socket Reference

### REST Endpoints

- **`/api/auth`**:
    - `POST /send-signup-email` - Delivers OTP & Magic Link.
    - `POST /verify-signup-email` - Validates OTP.
    - `GET /verify-email?register=<jwt>` - Validates Magic Link.
    - `POST /guest-session` - Creates guest session cookie.
    - `GET /get-me` - Fetches authenticated profile.
    - `POST /logout` - Invalidates active token.
    - `POST /claim-guest-chats` - Claims guest sessions.
- **`/api/chats`**:
    - `GET /` - Fetches active conversations list.
    - `GET /:chatId/messages` - Loads message history.
    - `DELETE /delete/:chatId` - Deletes chat and cascades.
    - `POST /uploads` - File upload endpoint (Images & PDF, 2MB each, max 5).

### WebSocket Flow

- **`chat:send`** (Client -> Server) - Submits chat query with file attachments.
- **`chat:chat_created`** (Server -> Client) - Emits details for first-message sessions.
- **`chat:thinking`** (Server -> Client) - Streams current AI reasoning token steps.
- **`chat:tool_call`** (Server -> Client) - Emits details about executing tool operations.
- **`chat:done`** (Server -> Client) - Emits final text string.
- `chat:error` (Server -> Client) - Emits failures.

### Postman Collection

- **Live Workspace Link**: [Cohort 2.0 Backend Collection](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
- **Local File Import**: import the local [Perplexity_API_Collection.postman_collection.json](server/Perplexity_API_Collection.postman_collection.json) export file directly into Postman (pre-populated with request schemas and mock response examples!).

---

## Environment Variables

Create a `server/.env` file referencing the following keys:

```env
# Server config
PORT=3000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
CLIENT_ORIGINS=http://localhost:5173,http://localhost:3000

# Redis Config
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# AI Credentials
GEMINI_API_KEY=your-gemini-key
MISTRAL_API_KEY=your-mistral-key

# Tool Credentials
TAVILY_API_KEY=your-tavily-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-key
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_URL_ENDPOINT=your-imagekit-url
LLAMA_CLOUD_API_KEY=your-llama-cloud-key

# Pinecone Config
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=cohort-2-rag

# Gmail OAuth API Config
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
GOOGLE_SENDER_EMAIL=your-sender-email

# Rollbar Config
ROLLBAR_ACCESS_TOKEN=your-rollbar-token
```

---

## Testing & Local Setup

### 1. Run Development Server

```bash
npm install
npm run dev
```

### 2. Run Integration Tests

The server incorporates integration tests using **Jest** and **Supertest** mocking databases, caches, and AI endpoints for fast execution times.

```bash
npm run test
```

Running the test suite automatically generates/updates the [API_REQUEST_RESPONSE_EXAMPLES.md](API_REQUEST_RESPONSE_EXAMPLES.md) reference file capturing real request and response formats.
