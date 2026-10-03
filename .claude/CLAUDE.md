# CLAUDE.md

Project guidance for AI agents (Claude Code) working in this repository.

## Project

Demo multi-currency wallet (**fiat + crypto**): public landing, auth, user area and admin panel. Demo only — no real payments, KYC, or personal-data storage; a persistent "Demo environment" banner is always shown. Logic and structure only: all user-facing copy goes through i18n keys, and landing copy is placeholder text. Never add real bank/company names, licence or regulatory claims, app-store badges or statistics.

## Tech Stack

- **Next.js (App Router) + TypeScript** (strict mode)
- **Redux Toolkit + React-Redux** — global state (Redux DevTools integrated in dev by default)
- **Tailwind CSS v4** — styling; visual layer comes from the purchased **Tapotik AI** theme (`theme/`, reference only); dark is the default
- **Theme UI stack** — shadcn-style primitives on **@base-ui/react** + `class-variance-authority`, **framer-motion** + **lenis** (landing effects), **next-themes** (light/dark), **sonner** (toasts)
- **GSAP + ScrollTrigger** (`@gsap/react` `useGSAP`) — landing scroll effects; import from `lib/gsap.ts` (plugins registered there), wrap animations in `gsap.matchMedia(MOTION_QUERIES.*)` so reduced-motion users get static content. Lenis is driven by GSAP's ticker (`components/effects/smooth-scroll.tsx`).
- Theme docs (local copy of the GitBook, with Orion deviations at the top): `.claude/docs/tapotik-ai.md` — read it before touching tokens, primitives or theme effects
- **next-intl** — i18n (EN only for now; RU was removed and will be re-added later — `LanguageSwitcher` hides itself while there is one language)
- **react-hook-form + zod** — forms & validation
- **recharts** — charts
- **lucide-react** — icons
- **Vitest** — unit tests (domain rules, schemas)
- Data: **orion-bank-api** (FastAPI, separate repo `../orion-bank-backend`, docs at `http://localhost:8000/api/docs`) for auth, profile and sessions; everything else still runs on the in-browser **mock repository** (`src/data`) until the API has it

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest run
```

Always run `npm run lint`, `npm run typecheck` and `npm test` before considering a task done.

## Directory Structure

```
src/
  app/[locale]/
    page.tsx           # landing (sections from config/landing.ts)
    auth/              # sign-in, sign-up, forgot-password
    app/               # user area (RequireAuth + RequireRole user)
    admin/             # admin panel (RequireAuth + RequireRole admin)
  components/
    ui/                # theme primitives (button, input, select, dialog, sheet, tabs, table, badge…) +
                       # form-field (TextField/SelectField/TextareaField/SwitchField), empty-state, error-state, spinner
    layout/            # app-shell, app-sidebar, app-topbar, notifications-menu, demo-banner, language-switcher, page-header
    effects/           # theme effects: aurora, reveal, spotlight-card, marquee, magnetic, smooth-scroll…
    site/              # page-loader (first-paint splash), section-heading
    Logo.tsx, ThemeToggle.tsx, ThemeProvider.tsx, AppReady.tsx
  config/              # currencies, payment methods, landing sections, navigation, route rules
  domain/              # types, money (bigint minor units), rules, ledger (submitRequest/applyRequest), review, rates
  data/                # Repository interface, MockRepository (in-memory + localStorage), seed, MockRatesProvider, blob store
  features/<feature>/  # UI components, zod schemas, service.ts per route (auth, payments, transfer, convert,
                       # verification, products, accounts, dashboard, settings, admin, landing, shared)
  store/               # configureStore, RTK Query `api` (wraps services), authSlice, uiSlice, typed hooks
  i18n/                # next-intl config, messages/en.json
  lib/                 # cn(), formatting, validation helpers, hooks
  types/               # app-level types (Language, SessionUser)
```

## Routes & Logic

- `/[locale]` — **Landing**: sections rendered from `config/landing.ts` (Hero, About, Services, Partners, License, Support, Contact us, Footer), one component per section in `features/landing/sections/`, each at least `min-h-svh` on desktop (`lg`+; on mobile content-height with a `SectionDivider` between them) with ScrollTrigger effects (desktop only) (Services is a 3×2 card grid, License cards stack); sections marked `data-snap` get proximity snapping (`lenis/snap` in `SmoothScroll`, CSS scroll-snap when Lenis is off); header links scroll to anchors; the contact form goes through the mock `sendContactMessage` mutation (nothing is sent).
- `/[locale]/auth/sign-in | sign-up | forgot-password` — real auth via the API; demo accounts (listed on the page) are seeded by `make seed` in the API repo with its `DEMO_PASSWORD`.
- `/[locale]/app/*` — `dashboard`, `transactions`, `deposit`, `withdraw`, `transfer`, `convert`, `verification`, `credit`, `cards`, `account-details`, `settings`, `support`, `about`. Page spec: `docs/admin-panel-scheme.md`.
- `/[locale]/admin/*` — `users` (admin home: all users) and `users/[id]` (profile, balances with manual adjustment, transactions, the user's requests with review actions), `registrations` (KYC review), `requests`, `conversions`, `credits`, `card-orders` (`card` requests: plan upgrades and physical cards), `settings` (currencies, methods, rates, fees, reset demo data).

Access control: the API session is the httpOnly `orion_sid` cookie. `proxy.ts` only sends guests (no cookie) away from `app`/`admin`; the root layout resolves the user with `getServerSessionUser()` (`features/auth/server.ts`, `GET /auth/me`) and `<RequireAuth>`, `<RequireRole>`, `<RequireKyc>`, `<GuestOnly>` do the role checks on the client via `redirectFor()` from `config/routes.ts`. An `unauthorized` answer from any API call ends the local session (`sessionGuard` in `store/store.ts`).

### Business rules
- Balances change in `applyRequest()` (`domain/ledger.ts`, mock, currently paused) when an admin approves — atomic and idempotent — and in the API's `POST /admin/users/{id}/adjustments` for an admin's manual credit/debit (reason required, debits only from available funds, writes an `adjustment` transaction + Notification + AuditEntry).
- Roles: `user` has a wallet; `admin` (the "master" user) has none — they see every user, open their data and act on it. Admin-only services go through `asAdmin()` (`features/admin/service.ts`).
- Debit requests (withdrawal, transfer, conversion, card) move `amount + fee` to `hold` on creation; rejection releases the hold. Card plan upgrades and physical card orders are `card` requests; approving a plan switches `user.cardPlan`.
- Withdrawal forms are generated from `config/methods.ts` field schemas + zod (`features/payments/fieldSchema.ts`); deposit methods show bank details / provider checkout / a crypto address instead (`DEPOSIT_FLOW`). Amount limits per currency live in `settings.limits`.
- Withdrawals and transfers require a 6-digit step-up code (mock: any 6 digits). Card numbers are "tokenized" in the service — only a token + last 4 are stored.
- Conversions: the UI shows indicative prices (`rates` query, mock feed moves every 30 s); "Convert now" locks a quote (`QUOTE_TTL_MS`) and the request is created by `quoteId`, never from client figures.
- KYC-gated operations are listed in `KYC_REQUIRED_OPERATIONS`; services enforce them too, not just the UI.
- Every review status change creates a user Notification and an AuditEntry.
- Money is integer minor units stored as strings; arithmetic via `domain/money.ts` (bigint), never floats.

## Conventions

### TypeScript
- Strict mode; no `any`. Domain types live in `src/domain/types.ts`, app-level ones in `src/types`.
- Derive form types from zod schemas via `z.infer` — one source of truth.

### State (Redux Toolkit)
- Configure the store with `configureStore` (DevTools auto-enabled in dev).
- Slices for client state only: `authSlice` (session), `uiSlice` (sidebar open/collapsed). Light/dark theme is owned by `next-themes`; read it through `useResolvedTheme()` (`lib/hooks`) to avoid hydration mismatches.
- Mock backend data goes through **RTK Query** (`store/api.ts`, `fakeBaseQuery` + `queryFn` calling feature services) for loading/error states and tag invalidation.
- Use typed hooks from `store/hooks.ts`: `useAppDispatch`, `useAppSelector` — never the untyped versions.

### i18n (next-intl)
- Locale-segmented routing under `app/[locale]/`.
- No hardcoded UI strings — use `useTranslations` (client) / `getTranslations` (server).
- All UI strings live in `messages/en.json` (when another language is added, keep its key tree in sync with en.json).
- Format money with `formatMinor` / `useFormatMoney` and dates with `formatDate` (`lib/format.ts`).
- zod error messages are `validation.*` keys; translate with `useFieldError()`. Domain errors map to `domainErrors.*`.

### Components
- Default to **server components**; mark interactive parts `"use client"`.
- Reuse the theme primitives in `components/ui`; forms use the labelled wrappers from `components/ui/FormField.tsx` (selects are controlled — wire them with react-hook-form `Controller`).
- Screens are built from `features/shared/Panel.tsx` (theme card style; `flush` for edge-to-edge tables), `FormStatus.tsx` (FormError/FormSuccess) and `SummaryList.tsx`.
- Handle three states for lists/forms: loading (skeletons), empty, error — `features/shared/AsyncContent.tsx`.
- Component files (`.tsx`) use PascalCase (`AppShell.tsx`); Next.js route files in `app/` (`page.tsx`, `layout.tsx`…), `index.tsx` and folder names stay as they are. Non-component modules (`.ts`: services, schemas, hooks, utils) keep their existing names. Rename case-only with a two-step `git mv` (macOS is case-insensitive); `npm run lint:case` catches mismatches.

### Styling
- Design tokens are CSS variables in `src/app/globals.css` (`:root` light, `.dark` dark) mapped to Tailwind via `@theme inline` (`primary`, `secondary`, `accent`, `background`, `card`, `muted`, `border`…). Reference tokens, not raw hex values; `lib/brand-colors.ts` is only for SVG gradients.
- Theme utilities: `glass`, `glass-strong`, `text-gradient`, `bg-grid`, `bg-dots`, `container-wide`; fonts Inter (body), Space Grotesk (`font-heading`), JetBrains Mono.
- The demo banner is a fixed 2rem strip: fixed/sticky headers, the sidebar and sheets sit at `top-8`.
- Code style follows the theme: Prettier with 4-space indent, double quotes, semicolons and Tailwind class sorting (`npm run format`).
- Responsive: sidebar collapses into a burger menu on mobile.

### Accessibility
- Semantic tags, `aria-*` on interactive elements, visible focus styles.

## API Layer
- Next rewrites `/api/v1/*` to `apiOrigin()` (`data/api/origin.ts`): `API_URL` if set, else `http://localhost:8000` in development and `https://orion-project-backend-production.up.railway.app` in production. The rewrite is baked in at `next build`. Calls stay same-origin, so the httpOnly cookie and the API's Origin check work without CORS — the API's `WEB_ORIGIN` must equal the web app's origin (`http://localhost:4000` locally; the deployed frontend domain on Railway, with `COOKIE_SECURE=true`).
- Browser calls go through `apiRequest()` (`data/api/http.ts`); the API's error envelope `{error: {code}}` becomes `ApiError.code` (`domain/errors.ts` lists the codes, messages under `domainErrors.*`). API shapes live in `data/api/types.ts`.
- On the API: sign-in/up/out, forgot-password, `/auth/me`, display currency, 2FA, password change, sessions, the user's accounts and transactions (`/me/accounts`, `/me/transactions`), and admin users (`/admin/users`, `/{id}`, `/{id}/accounts|transactions`, `POST /{id}/adjustments`). Still mock: requests, KYC, credits, cards, support, notifications, platform settings and the review queues.
- **Money movement is paused**: balances live in the API, so mock requests can't change them. Creating deposit/withdrawal/transfer/conversion/card requests and approving requests throw `moneyMovementPaused` (`assertMoneyMovementOpen()` in `data/api/bridge.ts`); the pages show `MoneyPausedNotice`. Lift this when the ledger moves to the API.
- Bridge (`data/api/bridge.ts`): API and mock share user ids; `mirrorUser()` copies an API user into the mock DB (with fiat accounts) on sign-in and on every `me`. `kycStatus`, `cardPlan` and `avatar` stay mock-owned until their features move to the API.
- Local env: `.env.development.local` (see `.env.example`); `NEXT_PUBLIC_DEMO_PASSWORD` fills the demo-account buttons.

## Mock Layer Rules
- Feature services wrap repository calls in `withLatency()` (Promise + `setTimeout`). Mutations without a payload resolve to `null`, never `undefined` (RTK Query rejects `{ data: undefined }`).
- The mock DB persists to `localStorage` (`orion-demo-db`); bump `DB_VERSION` in `data/seed.ts` when the shape changes. Uploaded KYC files stay in memory only.
- No real keys, passwords, or external network requests anywhere in the repo.

## How to Work
- Implement features incrementally; after each step, summarize what changed.
- Keep comments only where logic is non-obvious.
- Do not add libraries beyond the stack above without asking.

## graphify

- Code knowledge graph lives in `graphify-out/` (git-ignored). Build: `npm run graph:build`; refresh after changes: `npm run graph:update`. Exclusions: `.graphifyignore`.
- When the graph exists, orient with `graphify query "<question>"` / `graphify affected "<symbol>"` before grepping raw files.
- Full skill: `.claude/skills/graphify/SKILL.md` (trigger: `/graphify`).

@../AGENTS.md
