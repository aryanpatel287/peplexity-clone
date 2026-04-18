# Moodify Server Copilot Rules

Use these rules for all backend code in this server. Keep output consistent with existing patterns.

## Priority Order
1. Preserve current architecture and flow.
2. Match file naming, exports, and route documentation style.
3. Keep responses and middleware behavior consistent.
4. Prefer concise, readable code with early returns.

## 1) Architecture And Request Flow
- Entry flow must stay: `server.js` -> `src/app.js` -> routes -> middlewares -> controllers -> models/services.
- `server.js` responsibilities only:
  - Load env with dotenv.
  - Connect database.
  - Start server with `app.listen(...)`.
- `src/app.js` responsibilities only:
  - Create Express app.
  - Register global middleware (`express.json`, `cookie-parser`, `cors`).
  - Mount route modules under `/api/...`.
  - Export app.
- Do not place business logic in `server.js` or `src/app.js`.

## 2) Folder Responsibilities
- `src/config/`
  - Infrastructure clients and connectors only.
  - Examples: Mongo connection, Redis client.
  - Export initialized client or connector function.
- `src/models/`
  - Mongoose schema + model only (one model per file).
  - No request/response logic.
- `src/controllers/`
  - Request handling and orchestration.
  - Validate input, call models/services, return HTTP response.
- `src/middlewares/`
  - Cross-cutting request logic (auth, upload parsing, limits).
- `src/routes/`
  - Route declarations only.
  - Compose middleware + controller handlers.
  - Keep route comments in JSDoc style.
- `src/services/`
  - External provider wrappers (storage, third-party SDK calls).

## 3) Module System, Naming, And Exports
- Use ES Modules everywhere:
  - Imports: `import x from '...'` or `import { x } from '...'`
  - Exports: `export default ...` or `export { ... }`
- Do not generate CommonJS syntax (`require`, `module.exports`).
- Keep server package as ESM (`"type": "module"` in `package.json`) when using this rule set.
- For local imports in Node ESM, include the `.js` extension in import paths.
- File naming conventions:
  - `*.controller.js`, `*.routes.js`, `*.middleware.js`, `*.model.js`
  - `config` and `services` use descriptive names like `database.js`, `cache.js`, `storage.service.js`.
- Export style:
  - Single thing: `export default value`
  - Multiple handlers/utilities: `export { a, b }`
- Keep variable names explicit: `authRoutes`, `songController`, `connectToDb`, `userModel`.

## 4) Controller Rules
- Use `async function` controllers.
- Use guard clauses with early `return res.status(...).json(...)`.
- Validate required input before DB/service work.
- Keep response shape predictable:
  - Always include `message`.
  - Include resource payload keys like `user`, `song` when needed.
- Keep auth token source consistent: cookie key `token`.
- Avoid unused imports and dead variables.

## 5) Middleware Rules
- Auth middleware must:
  - Read token from `req.cookies.token`.
  - Reject missing/invalid token with `401`.
  - Check blacklist/cache before JWT verify.
  - Attach decoded user to `req.user`.
  - Call `next()` only on success.
- Upload middleware must:
  - Use multer memory storage.
  - Enforce file-size limit.
  - Be composed in routes (example: `upload.single("song")`).

## 6) Model Rules
- Define strict schema fields with `required` messages.
- Use `unique` where identity is required (username/email).
- Keep naming pattern:
  - `const thingSchema = new mongoose.Schema(...)`
  - `const thingModel = mongoose.model("collection", thingSchema)`
  - `export default thingModel`

## 7) Route Rules And Comment Style
- Routes should stay thin: route path + optional middleware + controller only.
- Keep top-of-route block comments in this style:

```js
/**
 * @route POST /api/auth/register
 * @description Register a user
 * @access Public
 */
```

- Use correct HTTP method and full mounted path in `@route`.
- Keep route comments updated whenever route behavior/path changes.

## 8) Environment And Setup Rules
- Use env vars for all secrets and connection settings.
- Existing env keys used by this server:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_ORIGINS`
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_PASSWORD`
  - `IMAGEKIT_PRIVATE_KEY`
- Never hardcode secrets or credentials in source files.

## 9) Error And Status Code Conventions
- `200`: successful read/update/logout/upload where resource is returned.
- `201`: successful resource creation (example: registration).
- `400`: missing input or malformed request.
- `401`: unauthenticated/invalid token.
- `404`: resource not found.
- `409`: duplicate user identity conflict.

## 10) Express Setup Template To Reuse
```js
// server.js
import 'dotenv/config';
import app from './src/app.js';
import connectToDb from './src/config/database.js';

connectToDb();
app.listen(3000, () => console.log('server running on port 3000'));
```

```js
// src/app.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import songRouter from './routes/song.routes.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_ORIGINS, credentials: true }));

app.use('/api/auth', authRouter);
app.use('/api/songs', songRouter);

export default app;
```

## 11) Keep This Prompt Effective
- Keep rules short and imperative.
- Put critical rules near the top.
- Do not add long explanations.
- If rules conflict, follow Priority Order.
