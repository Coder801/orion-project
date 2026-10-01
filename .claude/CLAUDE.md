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
- Data comes from an in-browser **mock repository** (`src/data`); there is no real backend

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
    logo.tsx, theme-toggle.tsx, theme-provider.tsx, app-ready.tsx
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
- `/[locale]/auth/sign-in | sign-up | forgot-password` — mock auth; sign-in accepts any registered email + any password of 8+ chars (demo accounts listed on the page).
- `/[locale]/app/*` — `dashboard`, `deposit`, `withdraw`, `transfer`, `convert`, `verification`, `credit`, `cards`, `account-details`, `settings`, `support`.
- `/[locale]/admin/*` — `registrations` (users + KYC review), `requests`, `conversions`, `credits`, `card-orders`, `settings` (currencies, methods, rates, fees, reset demo data).

Access control: `proxy.ts` redirects by the session cookie (optimistic); `<RequireAuth>`, `<RequireRole>`, `<RequireKyc>` repeat the checks on the client. Both use `redirectFor()` from `config/routes.ts`.

### Business rules
- Balances change **only** in `applyRequest()` (`domain/ledger.ts`) when an admin approves — atomic (repository transaction with rollback) and idempotent.
- Debit requests (withdrawal, transfer, conversion) move `amount + fee` to `hold` on creation; rejection releases the hold.
- Deposit/withdrawal forms are generated from `config/methods.ts` field schemas + zod (`features/payments/fieldSchema.ts`).
- Conversions quote through the `RatesProvider` interface; the rate is locked in the request.
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
- Reuse the theme primitives in `components/ui`; forms use the labelled wrappers from `components/ui/form-field.tsx` (selects are controlled — wire them with react-hook-form `Controller`).
- Screens are built from `features/shared/panel.tsx` (theme card style; `flush` for edge-to-edge tables), `form-status.tsx` (FormError/FormSuccess) and `summary-list.tsx`.
- Handle three states for lists/forms: loading (skeletons), empty, error — `features/shared/async-content.tsx`.
- New component files use kebab-case (theme convention); `domain/`, `data/`, `store/` keep their existing names.

### Styling
- Design tokens are CSS variables in `src/app/globals.css` (`:root` light, `.dark` dark) mapped to Tailwind via `@theme inline` (`primary`, `secondary`, `accent`, `background`, `card`, `muted`, `border`…). Reference tokens, not raw hex values; `lib/brand-colors.ts` is only for SVG gradients.
- Theme utilities: `glass`, `glass-strong`, `text-gradient`, `bg-grid`, `bg-dots`, `container-wide`; fonts Inter (body), Space Grotesk (`font-heading`), JetBrains Mono.
- The demo banner is a fixed 2rem strip: fixed/sticky headers, the sidebar and sheets sit at `top-8`.
- Code style follows the theme: Prettier with 4-space indent, double quotes, semicolons and Tailwind class sorting (`npm run format`).
- Responsive: sidebar collapses into a burger menu on mobile.

### Accessibility
- Semantic tags, `aria-*` on interactive elements, visible focus styles.

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
