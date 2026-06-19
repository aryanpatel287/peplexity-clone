# Perplexity Client

Frontend app for authentication and AI chat experience.

## What This App Does

- **Comprehensive User Auth Screens:** Integrated login and register views utilizing secure HttpOnly cookies.
- **Dynamic Dashboard Chat Interface:** Multi-chat layout with sidebar history, session controls, and chat deletion features. Supports responsive split views.
- **Real-Time Stream HUD:** Displays interactive visual states for AI reasoning tokens (`chat:thinking`), invoked LangChain agent tools (`chat:tool_call`), completed markdown blocks, and connection status.
- **Multimodal Upload Deck:** Interactive upload zone accepting images and document types (PDFs, PPTX, DOCX, TXT, CSV, JSON, Markdown). Showcases inline status indicators, file size validations, upload progress, and a gallery lightbox.
- **Rich Markdown Rendering Pipeline:** Parses LaTeX blocks and inline math symbols using KaTeX. Leverages `rehype-raw` to output physical keyboard buttons (`<kbd>`), custom highlights, and collapsible accordion selectors. Footnote references dynamically highlight and smooth-scroll on click.
- **Diagnostics & Error Boundaries:** Uses client boundaries to catch runtime exceptions and logs anonymized diagnostic telemetry and session playbacks through Rollbar when configured.

## Stack

- **React 19** & **Vite**
- **Redux Toolkit** (Global state slices for auth and chat streaming)
- **React Router v7** (Declarative routing)
- **Axios** (Configured client for base REST queries)
- **Socket.IO Client** (Persistent socket connections with state persistence)
- **Sass (SCSS)** (Modular stylesheets with CSS-Variables)
- **Markdown & Math**: `react-markdown` + `remark-gfm` + `rehype-raw` + `katex`
- **Error Tracking**: `rollbar` client SDK
- **Icons**: Lucide React + Remix Icon

## Routing

- `/`
  - Protected root, renders dashboard sidebar and default chat prompt interface
- `/c/:chatId`
  - Opens a specific chat session inside the dashboard viewport
- `/dashboard`
  - Redirects user back to root `/`
- `/login`
  - Authentication portal
- `/register`
  - Account signup portal
- `/forbidden`
  - Standard permission error view
- `*`
  - Custom 404 Not Found fallback view

## State Management

Redux slices (`client/src/app/app.store.js`):
- **auth**
  - Session verification, user metadata, loading/error states.
- **chat**
  - Conversations index map, current session tracker, list states, file uploading queue, real-time message stream flags (`thinking`, `toolCall`, `streamingText`).

## API Integration

The client calls backend REST endpoints via Axios:
- Auth Endpoints: `{VITE_API_URL}/api/auth`
- Chat Endpoints: `{VITE_API_URL}/api/chats`

For complete request and response schemas, refer to the [Auto-Generated API Reference](../server/API_REQUEST_RESPONSE_EXAMPLES.md).

Primary Rest Calls:
- `/api/auth/send-signup-email` & `/api/auth/verify-signup-email`
- `/api/auth/google` (Google OAuth trigger redirection)
- `/api/auth/guest-session` (Guest initialization)
- `/api/chats` (List all user/guest chats)
- `/api/chats/:chatId/messages` (Load historical conversation message log)
- `/api/chats/delete/:chatId` (Remove active chat session)
- `/api/chats/uploads` (Upload file payload to ImageKit middleware)

## Socket Integration

Listens for real-time push events from the Express server:
- `chat:chat_created` (Emitted on first message in a thread to link the session title)
- `chat:thinking` (Passes current AI reasoning thoughts)
- `chat:tool_call` (Indicates active tool usage like web search or file retrieval)
- `chat:done` (Signals final response string is fully flushed)
- `chat:error` (Handles socket-specific processing errors)

Emits client actions:
- `chat:send` (Submits user prompt and attachments to active thread)

## Environment Variables

Create `client/.env`:
- `VITE_API_URL` (Base backend server REST URL)
- `VITE_SOCKET_URL` (Base backend server WebSocket connection URL)
- `VITE_ROLLBAR_CLIENT_TOKEN` (Optional - Rollbar token for client-side diagnostics)

Example:
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_ROLLBAR_CLIENT_TOKEN=your-token-here
```

## Run Locally

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Scripts

- `npm run dev`: Launch hot-reloading development server
- `npm run build`: Compile bundle optimized for production
- `npm run lint`: Code formatting audit
- `npm run preview`: Serve production bundle locally for previewing


## Folder Map

```text
client/
  src/
    app/
      App.jsx
      app.routes.jsx
      app.store.js
    features/
      auth/
        components/
        hooks/
        pages/
        services/
        styles/
      chat/
        components/
          chat-area/
            helpers/
        hooks/
        pages/
        services/
        styles/
      shared/
        components/
        pages/
        styles/
        utils/
```
