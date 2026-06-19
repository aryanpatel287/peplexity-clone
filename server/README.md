# Perplexity Server

Backend API and socket server for the Perplexity clone application.

## API Testing & Examples

We use Jest and Supertest to write integration tests verifying all routes. The test runner compiles exact request/response schemas dynamically:

- **Auto-Generated API Reference:** [API_REQUEST_RESPONSE_EXAMPLES.md](API_REQUEST_RESPONSE_EXAMPLES.md)
- **Postman Collection:** [Cohort2.0 Backend Collection (Live Link)](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
  - Alternatively, import the local [Perplexity_API_Collection.postman_collection.json](Perplexity_API_Collection.postman_collection.json) export file directly into Postman (pre-populated with request schemas and mock response examples!).

To execute the tests and refresh the documentation:
```bash
npm run test
```

## What This Service Does

- **Authentication & Claims Management:** Full registration, email validation (OTP & Magic Links), login, logout, and password resets using secure HttpOnly cookies. Supports seamless migration of guest chat sessions to user profiles.
- **Bi-directional AI Orchestration:** WebSockets (Socket.IO) controller streaming raw tokens, thought processes (`chat:thinking`), tool logs (`chat:tool_call`), final responses, and client rate limit warnings.
- **Multimodal Document Uploads:** Processes batch uploads of images and documents (PDF, PowerPoint, Word, TXT, CSV, JSON, Markdown) via ImageKit storage.
- **Isolated Parsing & Direct Ingest:** Features direct markdown fetching and plain-text file handlers to bypass LlamaParse where unnecessary. Each file in a batch is processed in isolation, preventing a single corrupted file from crashing the entire batch upload.
- **Secure Chat-Scoped RAG:** Ingests document chunk vectors mapped to the current `chatId`. Pinecone vector searches and MongoDB chunk lookups enforce ownership restrictions to prevent cross-chat data leakage.
- **Centralized Telemetry & PII Stripping:** Centralized Rollbar error logging that strips passwords, cookie strings, authorization tokens, and anonymizes IP addresses.
- **Security Hardening:** Mounts early security filters blocking malicious bots scanning for configuration files (`.env`), scripts (`.php`), and backup structures (`.php.bak`, etc.), and helmet CSP rules.

## Stack

- **Runtime Environment:** Node.js (ESM import syntax)
- **Application Framework:** Express 5
- **Database Layer:** MongoDB & Mongoose 9 (Schemas, virtuals, and index controls)
- **Vector Storage:** Pinecone (Vector database client)
- **Caching & OTP Store:** Redis (ioredis client, supporting JWT blacklists, OTP TTL, and guest message counters)
- **Authentication Engine:** Passport (Google OAuth 2.0 verification) + JWT
- **AI Orchestration Framework:** LangChain (Tools, agents, and concurrency middleware)
- **Language Models (LLMs):** Google GenAI (`gemma-4-31b-it` & `gemini-3.1-flash-lite`), Mistral AI (`mistral-medium-latest`)
- **Document parsing utilities:** Llama Cloud (LlamaParse SDK), UnPDF, pdf-parse
- **Mail Integration:** Nodemailer + Gmail API (OAuth2 authorization)
- **Error Tracking:** Rollbar SDK

## AI Models Used

The server configures several models for agent execution:
- **`gemma-4-31b-it`** (via `@langchain/google-genai`)
  - Primary LLM utilized in the streaming agent handler (`getGeminiAgent(chatId)`).
- **`gemini-3.1-flash-lite`** (via `@langchain/google-genai`)
  - Specialized, highly concurrent model used to extract metadata, section indexes, and summaries from uploaded files.
- **`mistral-medium-latest`** (via `@langchain/mistralai`)
  - Generates conversational titles for new chat sessions.
- **`mistral-embed`** (via `@langchain/mistralai`)
  - Translates raw document chunks and user search queries into vector embeddings.

## AI Tools Used

The agent is granted access to the following tools:
- **`emailTool`**
  - Sends formatted HTML messages to recipients via the Gmail API SMTP pool.
- **`searchInternetTool`**
  - Interrogates the Tavily search engine to resolve real-time internet information.
- **`getCurrentDateTime`**
  - Resolves current timestamp in the `Asia/Kolkata` (IST) timezone for time-aware queries.
- **`createContextRetrieverTool(chatId)`**
  - Closure factory that compiles a chat-scoped tool to pull context from Pinecone and MongoDB chunk databases.

## RAG Pipeline (High Level)

1. **Upload:** User sends files → uploaded to ImageKit.
2. **Inspect & Route:** Plain text/JSON files get raw content read. Markdown files get fetched directly. PDFs/Office files get passed to LlamaParse.
3. **Parse & Structure:** Files get summarized, keywords extracted, and segmented by heading tags.
4. **Chunk:** Structured texts are split using recursive character chunking (700 character size, 120 character overlap).
5. **Index:** Chunks are saved to MongoDB, embedded using Mistral Embeddings, and vector indexed in Pinecone using the active `chatId` as a metadata filter.
6. **Query:** Agent invokes `contextRetrieverTool` → queries Pinecone utilizing a strict `chat` filter -> retrieves original chunks from MongoDB using matching object IDs.

## Data Models

- **users**: Username, lowercase unique email, hashed password, verified status, and Google OAuth ID fields.
- **chats**: User-specific or guest-specific conversational threads.
- **messages**: Prompt payloads mapped to chats. Files are attached via mongoose virtual models.
- **files**: ImageKit handles, sizes, original filenames, parsing state records, and summaries/keywords.
- **chunks**: Plain text and markdown chunks with associated page ranges and parent file references.


## API Routes

Base URL: /api

### Auth routes

- POST /auth/send-signup-email
- GET /auth/verify-email?register=<token>
- POST /auth/verify-signup-email
- GET /auth/google
- GET /auth/google/callback
- POST /auth/guest-session
- GET /auth/get-me
- POST /auth/logout
- POST /auth/claim-guest-chats

### Chat routes

- POST /chats/message
- GET /chats
- GET /chats/:chatId/messages
- DELETE /chats/delete/:chatId
- POST /chats/uploads

Upload constraints:

- Allowed mimetypes: image/*, application/pdf
- Max size: 2 MB per file
- Max files per request: 5

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

Copy server/.env.example to server/.env and fill in the values.

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
    rag/
    routes/
    services/
      ai/
      mail/
    sockets/
    utils/
    validators/
```

## Important Notes

- Keep env secrets out of version control.
- Cookies and CORS require matching frontend origin.
- Redis is used to store logged-out tokens for blacklist behavior.
