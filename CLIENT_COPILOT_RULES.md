# Client Copilot Rules (Global React + SCSS)

Use these rules for React client code in this workspace.

## Priority Order
1. Keep feature-first architecture and layer boundaries.
2. Keep code readable by splitting UI and logic early.
3. Match existing routing, state, and style conventions.
4. Keep output short, consistent, and production-safe.

## 1) Core Architecture (4 Layers)
- Follow this flow strictly:
  - UI layer (pages/components) -> hooks -> services API
  - hooks <-> context state
- Context stores state only. No network calls inside context files.
- Services do API calls only. No React imports in services.
- UI should not call axios directly. UI calls hook actions.

## 2) Feature-First Folder Rules
- Keep code under `src/features/<feature>/`.
- Standard feature folders:
  - `components/` for reusable UI blocks
  - `pages/` for route-level screens
  - `hooks/` for state/action orchestration
  - `services/` for API wrappers
  - `styles/` for feature styles
  - context file in feature root (example: `post.context.jsx`, `song.context.jsx`)
- Put cross-feature UI and styles in `src/features/shared/`.

## 3) ESM And Imports
- Use ES Modules only (`import` and `export`).
- Keep import groups in this order:
  - React and library imports
  - feature/shared imports
  - style imports
- Use named exports for hooks/services helpers.
- Use default export for page/component modules unless a file clearly benefits from named exports.

## 4) Context Layer Rules
- Context files should:
  - Create context
  - Hold state with `useState`
  - Expose state + setters through provider value
- Do not put request orchestration in provider unless truly global and unavoidable.
- Keep context values minimal and feature-scoped.

## 5) Hook Management Rules
- Hooks are the orchestration layer:
  - Read/write context state
  - Call services
  - Expose `handle...` actions and derived state to UI
- Wrap async actions with `setLoading(true)` and `setLoading(false)` using `try/finally`.
- Handle API failure in hooks, not in components.
- Avoid duplicate fetch effects across page and hook; pick one source of truth.
- Return only what UI needs.

## 6) Services API Rules
- Keep one API module per feature under `services/`.
- Use `import.meta.env.VITE_API_URL` for base URL.
- Use `withCredentials: true` for authenticated flows.
- Return `response.data` only.
- Do not mutate React state in service files.
- Prefer `params` in axios for query values instead of string concatenation when practical.
- Remove debug `console.log` from service files.

## 7) UI Layer Rules (Pages And Components)
- Pages:
  - Compose sections, trigger top-level actions, and wire route concerns.
  - Keep heavy rendering blocks delegated to components.
- Components:
  - Stay presentational where possible.
  - Receive data and callbacks through props.
  - Keep side effects local and necessary.
- Keep loading and empty states explicit in UI.
- Guard against null data before rendering lists or nested values.

## 8) Component Splitting Rules (Readability)
- Split a component when any of these is true:
  - File grows beyond about 120-150 lines of JSX + logic.
  - More than one independent concern exists (example: player controls + metadata + volume panel).
  - Repeated JSX block appears 2+ times.
  - A route page starts owning reusable card/list/item markup.
- Keep split boundaries meaningful:
  - Container behavior in page/hook
  - Reusable visual unit in component

## 9) Routing And App Composition
- Keep router config centralized in `app.routes.jsx`.
- Keep provider composition at app root (`App.jsx`).
- Use route wrappers/components for access control (example: protected route pattern).
- Keep route elements focused; avoid large inline JSX trees inside route config.

## 10) SCSS And Shared Style Rules
- Keep one global style entry and import it once at app entry.
- Keep reusable shared styles in a shared styles area (global, mixins, buttons, wrappers).
- Keep feature-specific styles colocated under each feature.
- Each page/component should import its own local style file when styles are feature-local.
- Use `@use` for style composition.
- SCSS partials should use underscore prefixes (example: `_mixins.scss`).
- SCSS filenames should be kebab-case.
- CSS classes should be readable kebab-case, optionally with modifier pattern like `--loading`.
- Prefer kebab-case for new style/component grouping folder names.
- Use mixins for repeated layout/utilities (flex, truncation, shimmer, card surface).
- Do not create one-off mixins for single-use declarations.
- Keep nesting shallow (prefer up to 3 levels) and aligned with JSX structure.
- For repeated list UIs, reuse shared wrapper/card patterns instead of redefining structure per feature.
- Keep responsive rules close to the component/page that owns them.

## 11) CSS Variables And Token Rules
- Do not add unnecessary CSS variables.
- If a token system exists, reuse existing tokens first.
- Add new variables only when theme-defining or reused in 3+ places.
- Never create variables for single-use values.
- If a codebase uses literal values, keep that style unless repeated values justify extraction.
- Reuse existing spacing, radius, and typography scales before adding new tokens.

## 12) Button And Interaction Rules
- Keep a reusable base button class and modifier variants (primary, secondary, size modifiers).
- Keep disabled and focus-visible states defined in shared styles.
- Prefer shared button classes over one-off per-component button styling.

## 13) Data-Safe UI And Naming Consistency Rules
- Guard null/undefined values before list rendering or nested value access.
- Always include explicit loading and empty states for async UI.
- Ensure long user-generated text wraps safely.
- Keep backend response keys and frontend context/hook/UI keys identical.
- Use consistent naming conventions:
  - React component files: PascalCase
  - Hooks: `useX` naming
  - SCSS files and CSS classes: kebab-case

## 14) If Plain CSS Is Used Instead Of SCSS
- Keep the same architecture and style ownership rules.
- Keep global/shared styles centralized and feature styles colocated.
- Replace mixin reuse with utility classes only when reuse is real.
- Keep naming, responsiveness, and button system rules unchanged.

## 15) Clean Code And Prompt Efficiency Rules
- Remove dead code and commented-out blocks before final output.
- Keep comments only for non-obvious decisions.
- Prefer small, focused functions over long inline handlers.
- Keep generated output concise and implementation-first.
- Follow existing file and naming conventions before introducing new patterns.
- If a conflict appears, follow the Priority Order at the top.
