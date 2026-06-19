<!-- prettier-ignore -->
<div align="center">

<h1>Perplexity Clone</h1>

_A premium, full-stack AI-powered search engine with real-time stream orchestration, secure chat-scoped RAG, dynamic agent tools, and advanced LaTeX/Markdown rendering._

[![Official Demo](https://img.shields.io/badge/Demo-Live_Site-blue?style=flat-square&logo=googlechrome&logoColor=white)](https://perplexity.aryanpatel.in)
[![Node version](https://img.shields.io/badge/Node.js->=20-3c873a?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React version](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Express version](https://img.shields.io/badge/Express-5.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)

⭐ If you like this project, star it on GitHub — it helps a lot!

[Overview](#overview) • [Key Features](#key-features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Getting Started](#getting-started) • [API & Socket Reference](#api--socket-reference)

</div>

## Overview

This repository contains a production-grade, full-stack clone of the Perplexity AI search engine. It features an interactive React frontend and a powerful Express backend that integrates multiple AI models (Google Gemini and Mistral AI) using LangChain.

The application utilizes an advanced RAG (Retrieval-Augmented Generation) pipeline to extract content from user-uploaded documents and images, enabling context-aware chat experiences. It is fully responsive, optimized for both authenticated users and guests, and includes enterprise-level security precautions.

> [!TIP]
> You can experience the live app at [perplexity.aryanpatel.in](https://perplexity.aryanpatel.in). To run the project locally, ensure you have Redis and MongoDB instances running before starting the development servers.

---

## Key Features

- **Real-Time Stream Orchestration**: Utilizes WebSockets (Socket.IO) to stream raw response tokens, detailed reasoning thoughts (`chat:thinking`), and active tool execution statuses (`chat:tool_call`) directly to the client.
- **Secure Chat-Scoped RAG**: Restricts document context vectors in Pinecone and database chunks in MongoDB utilizing strict `chatId` filters, preventing cross-chat document information leaks.
- **Hybrid Passwordless Authentication**: Manages stateful user sessions (JWT in secure HttpOnly cookies) for both registered users (OTP and Magic Link delivery via Gmail API) and guests. Includes automatic chat session migration to user profiles upon signup.
- **Multimodal Document Uploads**: Supports concurrent file uploads (images, PDFs, PowerPoint, Word, TXT, CSV, JSON, Markdown). Integrates isolated processing logic to prevent a single parsing error from crashing batch processes.
- **Isolated Parsing & Fallbacks**: Smart routing bypasses heavy document parsing (LlamaParse) for images and text-based files, preserving API credits and maximizing response speeds.
- **Dynamic AI Agent Tools**: Empowers the AI agent with tools to query web search (Tavily Search API), send transaction emails (Gmail API), check localized date/time (IST timezone), and retrieve chat-scoped document context.
- **Enhanced Formatting & Renderers**: Custom markdown parser that supports LaTeX math equations (KaTeX), physical keyboard keycaps (`<kbd>`), translucent highlights (`==text==`), collapsible accordion details, and academic footnotes with smooth scrolling.
- **Vulnerability Scanner Protection**: Mounted middleware to block malicious scanners looking for configuration files (`.env`), backup files (`.bak`), or PHP scripts (`.php`), returning early 404s to optimize resource usage.

---

## Tech Stack

| Component        | Technology                                           | Description                                                                                                                                        |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client**       | React 19, Vite 7, Redux Toolkit, React Router v7     | Modern single-page app layout with modular state management and custom SCSS layouts.                                                               |
| **Server**       | Node.js (ESM), Express 5, Socket.IO                  | High-concurrency server hosting REST APIs and bidirectional websocket channels.                                                                    |
| **Database**     | MongoDB (Mongoose 9), Redis, Pinecone                | Multi-tier storage layer separating structural metadata, vectors, and session caches.                                                              |
| **AI Models**    | Google Gemini, Mistral AI, Mistral Embeddings        | Multi-model orchestration: Gemini (`gemma-4-31b-it`) for reasoning; Mistral (`mistral-medium-latest` & `mistral-embed`) for titles and embeddings. |
| **Integrations** | LlamaCloud (LlamaParse), Tavily, ImageKit, Gmail API | Supporting services for parsing documents, searching the web, hosting uploads, and sending emails.                                                 |

---

## Architecture

The project is split into two specialized applications for decoupled, monorepo-style deployment:

```
┌───────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Redux   │  │  Hooks   │  │  API     │  │  Socket.IO   │   │
│  │  Store   │←→│ useAuth  │←→│ Services │←→│  Client      │   │
│  │ auth+chat│  │ useChat  │  │ (axios)  │  │              │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└───────────────────────┬───────────────────────┬───────────────┘
                        │ HTTP (REST)           │ WebSocket
                        ▼                       ▼
┌───────────────────────────────────────────────────────────────┐
│                         SERVER (Express 5)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Routes  │→ │ Middle-  │→ │ Control- │→ │  Services    │   │
│  │          │  │ ware     │  │ lers     │  │  (AI, Mail,  │   │
│  │          │  │ (auth)   │  │          │  │   Image)     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Socket.IO│  │ RAG      │  │ Models   │  │  Config      │   │
│  │ Server   │  │ Pipeline │  │(Mongoose)│  │ (env,db,     │   │
│  │          │  │          │  │          │  │  cache)      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└───────────────────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ MongoDB │   │ Pinecone │   │  Redis   │
   │         │   │ (Vector) │   │ (Cache)  │
   └─────────┘   └──────────┘   └──────────┘
```

> [!NOTE]
> For production deployment, running `npm run build` in the server directory bundles the React client app directly into the server's public folder for single-host static delivery.

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js LTS](https://nodejs.org/) (v20 or higher recommended)
- [MongoDB Server](https://www.mongodb.com/) (or MongoDB Atlas URI)
- [Redis Server](https://redis.io/)

### 1. Installation

Clone the repository and install dependencies in both project directories:

```bash
# Clone the repository
git clone <your-repo-url>
cd perplexity-clone

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configuration

Create local environment configuration files using the provided templates:

- **Server**: Copy `server/.env.example` to `server/.env` and supply the required API keys (MongoDB, Redis, Gemini, Mistral, Pinecone, Tavily, ImageKit, Llama Cloud, and Gmail OAuth credentials).
- **Client**: Copy `client/.env.example` to `client/.env` and update the connection ports if custom values are used.

### 3. Launch Development Servers

Start both application instances concurrently:

- **Backend Server** (Terminal 1):
    ```bash
    cd server
    npm run dev
    ```
- **Frontend Client** (Terminal 2):
    ```bash
    cd client
    npm run dev
    ```

Once both processes are running, visit `http://localhost:5173` in your browser.

---

## API & Socket Reference

The server exposes a REST API for session state management and a Socket.IO interface for chat operations.

### Key REST Endpoints

- **Authentication (`/api/auth`)**:
    - `POST /send-signup-email` - Requests alphanumeric OTP & Magic Link.
    - `POST /verify-signup-email` - Verifies OTP and creates/logs in user.
    - `GET /verify-email?register=token` - Verifies Magic Link.
    - `GET /google` - Passport redirection portal for Google OAuth.
    - `POST /guest-session` - Registers/recovers temporary guest credentials.
- **Conversations (`/api/chats`)**:
    - `GET /` - Retrieves active chat histories.
    - `GET /:chatId/messages` - Loads message history.
    - `POST /uploads` - File uploading deck endpoint.

### WebSocket Communication Flow

- **Client Emits**:
    - `chat:send` - Sends prompt alongside attachment metadata.
- **Server Streams**:
    - `chat:chat_created` - Emits title and initialized message structures.
    - `chat:thinking` - Streams the model's intermediate thoughts.
    - `chat:tool_call` - Details about tool execution (e.g. web search, file ingestion).
    - `chat:done` - Emits final text string and stamps data models.

### Postman Collection

- **Live Workspace Link**: [Cohort 2.0 Backend Collection](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
- **Local File Import**: import the local [Perplexity_API_Collection.postman_collection.json](server/Perplexity_API_Collection.postman_collection.json) export file directly into Postman (pre-populated with request schemas and mock response examples!).

> [!IMPORTANT]
> The backend features a test suite verifying endpoint contracts. To run integration tests and automatically compile the API schema reference, execute `npm run test` in the `server/` directory. Check [server/API_REQUEST_RESPONSE_EXAMPLES.md](server/API_REQUEST_RESPONSE_EXAMPLES.md) for full request/response payloads.
