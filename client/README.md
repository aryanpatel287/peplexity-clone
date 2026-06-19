<!-- prettier-ignore -->
<div align="center">

<h1>Perplexity Clone - Client</h1>

*The interactive React SPA interface for the Perplexity clone, featuring a real-time stream HUD, drag-and-drop upload deck, and enhanced markdown parsing.*

[![React version](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite version](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Sass style](https://img.shields.io/badge/Sass-SCSS-CC6699?style=flat-square&logo=sass&logoColor=white)](https://sass-lang.com)

⭐ If you like this project, star it on GitHub — it helps a lot!

[Features](#features) • [Tech Stack](#tech-stack) • [Folder Structure](#folder-structure) • [State Management](#state-management) • [API & Socket Integration](#api--socket-integration) • [Environment Variables](#environment-variables) • [Run Locally](#run-locally)

</div>

## Features

- **Comprehensive User Authentication Screens**: Fully integrated passwordless sign-up/login modal flow with OTP inputs. Includes automatic guest-to-user chat session claim indicators.
- **Dynamic Dashboard Chat Interface**: Responsive multi-chat sidebar with historical session navigation, customizable names, and modal-based deletion confirmations.
- **Real-Time Stream HUD**: Renders live updates directly via socket events, showing the model's reasoning status (`chat:thinking`), active tool execution status (`chat:tool_call`), and token-by-typewriter streaming text.
- **Multimodal Upload Deck**: Seamless drag-and-drop file upload interface accepting files up to 2MB (max 5 files). Features thumbnail previews, progress status trackers, and a fullscreen lightbox gallery.
- **Rich Markdown Rendering Pipeline**: Render LaTeX block equations and inline math symbols via KaTeX. Integrates custom components for physically elevated keycaps (`<kbd>`), translucent highlights (`==text==`), accordion details, and smooth-scrolling footnotes.
- **Diagnostics & Telemetry**: Uses React Error Boundary layouts to catch client-side exceptions and forwards scrubbed debugging payloads to Rollbar in production.

---

## Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Core Framework** | React 19, Vite 7 | Main reactive framework and build setup. |
| **State Store** | Redux Toolkit 2 | Global store for auth sessions and active chat streams. |
| **Router** | React Router v7 | Handles declarative client-side viewport routes. |
| **HTTP Client** | Axios | REST api services configured with credential sharing for secure cookies. |
| **WebSockets** | Socket.IO Client 4 | Connects client instances to real-time server streams. |
| **Styles** | Sass (SCSS) | Modular layouts utilizing CSS custom properties for typography and dark theme tokens. |
| **Markdown & Math** | react-markdown, remark-gfm, rehype-raw, KaTeX | Parsing complex formatting structures, math notations, and code block highlight cards. |

---

## Folder Structure

```text
client/
├── src/
│   ├── app/                      # Application Shell
│   │   ├── App.jsx               # Entry Router & Layout Providers
│   │   ├── RootLayout.jsx        # Root Outlet + global modals
│   │   ├── app.routes.jsx        # App Route definitions
│   │   ├── app.store.js          # Redux Store configurator
│   │   ├── runtime.config.js     # API/Socket URL resolver
│   │   └── index.scss            # Global SCSS stylesheet imports
│   ├── features/                 # Modular Feature Architecture
│   │   ├── auth/                 # Authentication Portal Feature
│   │   │   ├── auth.slice.js     # Auth state controls
│   │   │   ├── components/       # SignUpModal, OtpInput, GoogleAuth buttons
│   │   │   ├── hooks/useAuth.js  # Auth actions integration hook
│   │   │   ├── services/         # auth.api HTTP requests
│   │   │   └── styles/           # SCSS styles for modals and OTP
│   │   ├── chat/                 # AI Conversation Feature
│   │   │   ├── chat.slice.js     # Chat and stream state slices
│   │   │   ├── components/       # ChatArea, Sidebar, Messages, Input decks
│   │   │   │   └── helpers/      # CodeBlocks, ThinkingBubble, ToolStatus chips
│   │   │   ├── hooks/useChat.js  # Chat operations hook
│   │   │   ├── services/         # chat.api HTTP & chat.socket real-time clients
│   │   │   └── styles/           # Layout, typography, and rendering sheets
│   │   └── shared/               # Globally Shared Utilities & Layouts
│   │       ├── components/       # ConfirmModal, common layout grids
│   │       ├── pages/            # Forbidden (403), Not Found (404)
│   │       ├── styles/           # Variables, resets, mixins, scrollbars
│   │       └── utils/            # Shared string/array manipulation helpers
│   └── main.jsx                  # Main bootstrapping script
└── index.html                    # Root HTML file
```

---

## State Management

Global state is organized in Redux Toolkit slices (`src/features/`):

### Auth Slice (`features/auth/auth.slice.js`)
Tracks the user context, loading status, active guest identifiers, and sign-up modal visibility toggle flags.

### Chat Slice (`features/chat/chat.slice.js`)
Manages a normalized index map of all active chat sessions, the selected conversation ID, upload queue statuses, rate limiting warnings (`guestLimitReached`), and real-time streaming states (`thinking`, `toolCall`, `streamingText`).

---

## API & Socket Integration

The client bridges communications via REST operations (Axios) and websocket events (Socket.IO):

### REST HTTP Transactions
All request/response schemas are detailed in the [Auto-Generated API Reference](../server/API_REQUEST_RESPONSE_EXAMPLES.md).
- Auth actions route through `/api/auth` (creating guest sessions, signing up with email OTP, or initializing Google OAuth redirection).
- Chat lists, message history lookups, file uploads, and chat deletion operate through `/api/chats`.

### WebSocket Events Mapping
The client listens to the following event states broadcast by the server:
- `chat:chat_created` - Emits title and initialized message structures.
- `chat:thinking` - Streams the model's intermediate thoughts.
- `chat:tool_call` - Details about tool execution (e.g. web search, file ingestion).
- `chat:done` - Emits final text string and stamps data models.
- `chat:error` - Broadcasts failures (such as `AUTH_REQUIRED` limits).

---

## Environment Variables

Create a `client/.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_ROLLBAR_CLIENT_TOKEN=your-token-here  # Optional for error monitoring
```

> [!NOTE]
> During local development, if environment variables are left blank, Vite defaults to resolving routes targeting the window's browser origin.

---

## Run Locally

Install the required modules and start Vite's hot-reloading development server:

```bash
# Install modules
npm install

# Start Vite server
npm run dev
```

Visit `http://localhost:5173` in your browser.
