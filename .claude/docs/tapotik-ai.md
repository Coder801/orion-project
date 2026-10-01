# Tapotik AI — theme documentation (local copy)

Source: https://bhplugin.gitbook.io/tapotik-ai (fetched 2026-10-01 from `/llms-full.txt`).
Refresh: `curl -sL https://bhplugin.gitbook.io/tapotik-ai/llms-full.txt` and re-apply the cleanup (GitBook `{% hint %}` → blockquotes, `{% stepper %}` tags removed).

## How Orion differs from the stock template

The docs below describe the template as shipped. In Orion (see `.claude/CLAUDE.md`):

- Routes live under `app/[locale]/` (`/`, `auth/*`, `app/*`, `admin/*`) — the `(marketing)`, `(auth)`, `(app)` groups and the AI/blog/docs/careers pages were removed.
- There is no `src/lib/data.ts`, `useSimulatedSubmit` or `lib/clipboard.ts`: data comes from the mock repository via RTK Query; copy goes through `copyToClipboard()` in `lib/utils.ts`.
- All copy comes from next-intl messages, never inline strings; `siteConfig` holds only the brand name (no URL, socials, sitemap or robots).
- The demo banner sits on top of every page, so fixed headers, the sidebar and sheets use `top-8`.
- Error boundaries use the stable `retry` prop (Next 16.3), not `unstable_retry`.
- Still valid as-is: design tokens and utilities in `globals.css`, `brandHex`, `next-themes` `.dark` strategy, `components/ui` primitives (shadcn `new-york` on Base UI, `components.json`), effects, fonts.

---

# Getting Started

**Tapotik AI** is a premium, animated, production-ready template built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Framer Motion**. It is designed for AI startups, SaaS products, workflow-automation platforms, enterprise AI tools, and creative agencies that need a futuristic, immersive marketing site plus a full dashboard — out of the box.

> **Info:** This template is **UI-only**. There is no backend, database, or API layer bundled in — all content is static/mock data and every form simulates submission. This keeps the theme framework-agnostic on the data side, so you can wire in whatever backend you prefer at clearly marked swap-in points.

## 🔥 Key Features

* **40+ pages** — marketing, product, dashboard, docs, auth, blog, and legal.
* **Full admin dashboard** — a complete app shell (sidebar + topbar) with 7 pages: overview with charts/KPIs, Chat/Image/Voice studios, Agents, multi-tab Settings, and Billing.
* **150+ components** — design-system primitives, effects, homepage sections, and app UI.
* **Dark & light mode** — dark-first futuristic aesthetic, fully token-driven via `next-themes` (`.dark` class strategy).
* **Immersive animations** — aurora backgrounds, spotlight cards, magnetic buttons, typewriter, marquees, scroll reveals, and 3D tilt.
* **Glassmorphism & bento grids** — a modern layout language used consistently throughout.
* **Fully responsive** — mobile-first and tested across breakpoints.
* **SEO optimized** — per-page metadata, Open Graph, `sitemap.xml`, and `robots.txt`.
* **Accessible** — semantic markup, focus-visible states, reduced-motion support, and ARIA labels.
* **Performance-first** — static/SSG prerendering, zero third-party scripts, zero image-CDN dependencies (visuals are CSS/SVG).
* **Near-perfect PageSpeed** — 98 Performance, 100 Accessibility, 100 Best Practices, 100 SEO in testing.

## 💡 Use Cases

**Tapotik AI** is a flexible foundation for any modern AI or SaaS product:

* **AI startups** — launch a polished marketing site + product demo pages fast.
* **SaaS products** — pair the landing pages with the included dashboard shell.
* **Workflow-automation platforms** — showcase agents and integrations.
* **Enterprise AI tools** — professional, accessible, dark-first UI.
* **Creative & dev agencies** — a reusable base to spin up client projects.
* **Developer tools & APIs** — ready-made docs section with quickstart, auth, and API pages.

## 🏆 Why Choose Tapotik AI

* **Built on the latest stack** — Next.js 16, React 19, Tailwind v4 — not legacy tooling.
* **Production-ready, not a mockup** — real routing, SEO, sitemap, and a11y baked in.
* **Truly token-driven** — rebrand the entire theme from a handful of CSS variables.
* **Server-first architecture** — fast by default, with interactivity isolated to client islands.
* **No bloat** — zero third-party scripts, zero image-CDN dependencies; all visuals are CSS/SVG.
* **Near-perfect Lighthouse scores** — proven performance, accessibility, and SEO (see below).
* **Clean, documented code** — strict TypeScript, ESLint gate, and centralized data/config.
* **Backend-agnostic** — clearly marked swap-in points to wire in any API.

## ⚡ Lighthouse / PageSpeed Insights

**Tapotik AI** is built for speed and quality. A [PageSpeed Insights](https://pagespeed.web.dev/) run of a production build (Desktop) scores near-perfect across the board:

| Metric           |  Score  |
| ---------------- | :-----: |
| ⚡ Performance    |  **98** |
| ♿ Accessibility  | **100** |
| ✅ Best Practices | **100** |
| 🔍 SEO           | **100** |

These results come from real architectural choices — static/SSG prerendering, zero third-party scripts, no image-CDN dependencies (all visuals are CSS/SVG), reduced-motion support, and semantic, accessible markup. Your own scores will vary with hosting, added scripts, and content.

## 🧰 Tech Stack

| Layer      | Tool                                                          |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                            |
| UI         | React 19, Tailwind CSS v4                                     |
| Components | shadcn/ui `new-york` primitives on **Base UI**                |
| Animation  | Framer Motion, Lenis smooth scroll, tw-animate-css            |
| Charts     | Recharts                                                      |
| Forms      | React Hook Form                                               |
| Command ⌘K | cmdk                                                          |
| Icons      | Lucide                                                        |
| Fonts      | Space Grotesk (headings), Inter (body), JetBrains Mono (code) |

## 📦 What's Inside

The project follows a **server-first with client islands** architecture. Route `page.tsx` files are Server Components; interactivity is isolated into colocated `_components/*-client.tsx` files marked `'use client'`.

```
src/
├── app/
│   ├── (marketing)/   # public site — navbar + footer layout
│   ├── (auth)/        # split-screen auth layout
│   ├── (app)/         # dashboard shell (sidebar + topbar)
│   ├── layout.tsx     # root: fonts, theme, toaster
│   └── globals.css    # design tokens + utilities + keyframes
├── components/
│   ├── ui/            # design-system primitives
│   ├── effects/       # aurora, reveal, marquee, spotlight, tilt…
│   ├── sections/      # homepage sections
│   ├── site/          # navbar, footer, command menu
│   └── docs/          # documentation blocks
├── config/site.ts     # site meta + navigation
└── lib/               # data, utils, clipboard + simulated-submit helpers
```

## 📑 Included Pages

**40+ pages** across four route groups — marketing, AI products, auth, and a full dashboard:

* **Marketing** — Home, About, Features, Pricing, Integrations, Changelog, Careers (+ job details), Contact, Blog (+ 6 articles), Docs (10 pages), Privacy, Terms, 404.
* **AI Products** — AI Chat, AI Image, AI Video, AI Voice, AI Agents (each with unique demo visuals).
* **Admin Dashboard** — Overview, Chat, Image, Voice, Agents, Settings, Billing (full app shell with sidebar + topbar).
* **Auth** — Login, Sign up, Forgot password.

See the full map in [**Site Preview**](#site-preview).

## 🌐 Browser Compatibility

Tested and supported on the latest versions of all modern browsers:

| Browser            | Supported |
| ------------------ | :-------: |
| Google Chrome      |     ✅     |
| Microsoft Edge     |     ✅     |
| Mozilla Firefox    |     ✅     |
| Safari (macOS/iOS) |     ✅     |
| Opera / Brave      |     ✅     |

Fully responsive across mobile, tablet, and desktop breakpoints. Internet Explorer is **not** supported (Next.js 16 targets modern evergreen browsers).

## 🔄 Free Lifetime Updates

Every purchase includes **free lifetime updates**. As the template evolves — new pages, components, dependency bumps, and fixes — re-download the latest version from your marketplace account at no extra cost.

## 💬 Dedicated Support

Need assistance? We're here to help! Your purchase includes **6 months of free support**, which can be extended anytime. Whether you need help with setup, bug fixing, or customization guidance, feel free to reach out.

📧 Contact Support: [Click Here](mailto:bhplugin@gmail.com)

# Site Preview

**Tapotik AI** ships with **40+ fully designed pages** across four route groups. Each group has its own layout and chrome. Below is a complete map of what's included.

## Demo

Site: <https://tapotik-ai.vercel.app/>

## 🌐 Marketing (`(marketing)/`)

Public-facing site with the shared navbar + footer.

| Page         | Route             | Description                                              |
| ------------ | ----------------- | -------------------------------------------------------- |
| Home         | `/`               | 15-section landing page with hero, bento, pricing, etc.  |
| About        | `/about`          | Company story, team, values.                             |
| Features     | `/features`       | Full feature breakdown.                                  |
| Pricing      | `/pricing`        | Tiered plans with toggle.                                |
| Integrations | `/integrations`   | Connect with popular tools.                              |
| Changelog    | `/changelog`      | Product updates timeline.                                |
| Blog         | `/blog`           | Article index (server-rendered for `?category=` filter). |
| Blog Post    | `/blog/[slug]`    | 6 full articles.                                         |
| Careers      | `/careers`        | Open roles.                                              |
| Job Detail   | `/careers/[slug]` | Individual role pages.                                   |
| Contact      | `/contact`        | Contact form (simulated submit).                         |
| Docs         | `/docs`           | 10 in-app documentation pages.                           |
| Privacy      | `/privacy`        | Legal policy.                                            |
| Terms        | `/terms`          | Legal terms.                                             |
| 404          | `*`               | Custom not-found page.                                   |

## 🤖 AI Products (`(marketing)/`)

Each product page has unique, interactive demo visuals.

| Page      | Route        | Description                                        |
| --------- | ------------ | -------------------------------------------------- |
| AI Chat   | `/ai-chat`   | Conversational assistant with multi-model support. |
| AI Image  | `/ai-image`  | Text-to-image generation.                          |
| AI Video  | `/ai-video`  | Cinematic text-to-video.                           |
| AI Voice  | `/ai-voice`  | Lifelike speech synthesis in 40+ languages.        |
| AI Agents | `/ai-agents` | Autonomous agents for complex workflows.           |

## 🔐 Auth (`(auth)/`)

Split-screen authentication layout.

| Page            | Route              |
| --------------- | ------------------ |
| Login           | `/login`           |
| Sign Up         | `/signup`          |
| Forgot Password | `/forgot-password` |

## 📊 Admin Dashboard (`(app)/`)

A complete admin dashboard with its own app shell — collapsible sidebar navigation + topbar (`AppShell`). Includes overview analytics, per-product studios, agent management, multi-tab settings, and billing.

| Page         | Route                 | Description                                     |
| ------------ | --------------------- | ----------------------------------------------- |
| Overview     | `/dashboard`          | KPIs, charts, activity.                         |
| Chat Studio  | `/dashboard/chat`     | Chat workspace.                                 |
| Image Studio | `/dashboard/image`    | Image generation workspace.                     |
| Voice Studio | `/dashboard/voice`    | Voice generation workspace.                     |
| Agents       | `/dashboard/agents`   | Agent management.                               |
| Settings     | `/dashboard/settings` | Profile / workspace / API keys / notifications. |
| Billing      | `/dashboard/billing`  | Plan & invoices.                                |

## 🎬 Explore the Template

Run the project locally (see [**Installation**](#installation)) and open [http://localhost:4000](http://localhost:4000/) to explore every page interactively.

# Installation

## ✅ Key Requirements

Before starting, you'll need:

* **Node.js version 20.9 or higher** (LTS recommended) — required by Next.js 16.
* A package manager like **npm** (bundled with Node), or `pnpm` / `yarn` / `bun`.
* A code editor (VS Code recommended).
* **Git** (optional, but recommended for deployment).

> **Info:** No database, backend, or server software is required — **Tapotik AI** is a UI-only template.

## 🚀 Getting Started

The setup involves three main steps:

## Extract the downloaded template file

## Open the folder in your code editor

## Install dependencies

Run `npm install` in the terminal to download dependencies into `node_modules`.

```bash
cd tapotik-ai
npm install
```

## 💻 Development & Production

To begin development, run the dev server (Turbopack) and open the site at `http://localhost:4000`:

```bash
npm run dev
```

When ready to launch, create an optimized production build and preview it locally:

```bash
npm run build
npm start
```

> **Info:** **Note:** `npm run build` is also the **type + lint gate**. `next.config.ts` does not ignore build or lint errors, so any TypeScript or ESLint error will fail the build.

## 🗂️ Key Configuration Files

Most customizations don't require modifying component code:

* **Site details** — `src/config/site.ts` (branding, navigation, social links, SEO metadata).
* **Design tokens** — `src/app/globals.css` (colors, radius, utilities).
* **Typography** — `src/app/layout.tsx` (Google Fonts via `next/font`).
* **Content & mock data** — `src/lib/data.ts` (blog posts, job openings, docs nav, pricing, testimonials).

See the [**Customization**](#customization) page for full details.

## 📜 Helpful Scripts

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `npm run dev`    | Dev server on port 4000 (Turbopack).                    |
| `npm run build`  | Production build (+ type & lint gate).                  |
| `npm start`      | Serve the production build.                             |
| `npm run lint`   | Run ESLint (flat config).                               |
| `npm run format` | Prettier write.                                         |
| `npm run cb`     | `format && lint && build` — run this before committing. |

## 🌍 Deployment Options

**Tapotik AI** is a standard Next.js 16 app and deploys to Vercel (recommended for simplicity) or any Node.js-compatible host like Railway or Render.

> **Warning:** Before deploying, update the production domain in `siteConfig.url` (`src/config/site.ts`) so metadata, `sitemap.xml`, and `robots.txt` generate correctly.

### Option A — Vercel (recommended, easiest)

## Push your project

Push your project to a GitHub / GitLab / Bitbucket repository.

## Import it into Vercel

Go to [vercel.com](https://vercel.com/), click **Add New → Project**, and import your repository.

## Deploy

Vercel auto-detects Next.js, just click **Deploy**. No extra configuration needed.

### Option B — Any Node.js host (VPS, Render, Railway, etc.)

## Build the app

```bash
npm run build
```

## Start the server

```bash
npm start
```

Serves on port 4000 by default.

## Configure your domain

Put it behind a reverse proxy (Nginx / Caddy) and point your domain at it.

> **Info:** Other platforms such as **Netlify**, **Cloudflare Pages**, and **AWS Amplify** work too — use their Next.js preset.

Most pages are statically prerendered (`○ Static` / `●`); `/blog` is server-rendered (`ƒ`) to support category filtering.

## 🧩 A Note on Data

This is a **UI-only** template — there is no backend. All content lives in `src/lib/data.ts` and forms simulate success via the `useSimulatedSubmit` hook (`src/lib/use-simulated-submit.ts`). Its `setTimeout` is the single seam to swap for a real API request when you add a backend.

# Customization

**Tapotik AI** is fully token-driven, so rebranding is fast and centralized. Here's how to make it yours.

## 🖌️ Changing the Brand

### Colors

Edit the CSS variables in `src/app/globals.css` (both `:root` and `.dark`).

### Site metadata

Update `siteConfig` in `src/config/site.ts` (name, URL, socials).

### Logo

Replace the mark in `src/components/logo.tsx` and `src/app/icon.svg`.

### Fonts

Swap fonts in `src/app/layout.tsx` (any Google font via `next/font`).

## 🎨 Design Tokens

Design tokens are CSS variables in `src/app/globals.css`, mapped into Tailwind v4 via `@theme inline`.

| Token          | Dark      | Light     |
| -------------- | --------- | --------- |
| `--primary`    | `#5B5BF7` | `#5B5BF7` |
| `--secondary`  | `#8B5CF6` | `#8B5CF6` |
| `--accent`     | `#00F5D4` | `#00C7AC` |
| `--pink`       | `#FF4ECD` | `#FF4ECD` |
| `--background` | `#050816` | `#F7F8FC` |
| `--card`       | `#0E1325` | `#FFFFFF` |

> **Info:** The brand color is single-sourced. Use the `globals.css` tokens for CSS/Tailwind classes; for SVG fills and Recharts, use `brandHex` from `src/lib/brand-colors.ts`.

## ✨ Custom Utilities

The template adds a set of utility classes on top of Tailwind:

* **Surfaces:** `glass`, `glass-strong`, `border-gradient`
* **Text:** `text-gradient`, `text-gradient-pink`, `shimmer-text`
* **Backgrounds:** `bg-grid`, `bg-dots`
* **Layout:** `container-wide`
* **Animations:** `animate-aurora`, `animate-float`, `animate-marquee`, and more.

## 🌗 Dark / Light Mode

Theming uses the **`.dark` class strategy** (via `next-themes`), not a media query. The `@custom-variant dark` in `globals.css` drives all dark-mode styling. Both themes are fully designed — the template is dark-first.

## 📝 Editing Content

All copy and mock content is centralized in **`src/lib/data.ts`** — blog posts, job openings, docs navigation, pricing tiers, testimonials, and more. Dynamic routes (`blog/[slug]`, `careers/[slug]`) key off this file via `generateStaticParams`, so adding an entry there automatically generates its page.

Navigation structure (navbar + footer) lives in **`src/config/site.ts`**.

## 🧱 Adding Components

`src/components/ui/*` are shadcn/ui `new-york`-style wrappers over **Base UI**. Add new primitives with:

```bash
npx shadcn@latest add [component]
```

`components.json` drives the registry configuration.

When adding interactive UI, follow the **server-first + client island** pattern: keep the `page.tsx` a Server Component and isolate interactivity into a colocated `_components/*-client.tsx` file marked `'use client'`.

## 🔌 Wiring a Real Backend

When you're ready to go beyond UI-only, these are the swap-in points:

* **Forms** — route submits through `useSimulatedSubmit` (`src/lib/use-simulated-submit.ts`); replace its `setTimeout` with a real request. Pair with `SubmitButton` (`ui/submit-button.tsx`) for the pending state.
* **Social links** — the URLs in `siteConfig.links` are placeholders; replace them.
* **Copy actions** — go through `copyWithToast()` (`src/lib/clipboard.ts`).

# Support

Thanks for choosing **Tapotik AI**. We're here to help you get the most out of the template.

## 📚 Before You Reach Out

Most questions are answered in this documentation:

* [**Getting Started**](#getting-started) — overview & key features.
* [**Site Preview**](#site-preview) — every page included.
* [**Installation**](#installation) — setup, scripts, deployment.
* [**Customization**](#customization) — branding, tokens, content, backend swap-in points.

Also check the project's `README.md` for conventions and architecture notes.

## 💬 Getting Help

For support and queries, email us at **<bhplugin@gmail.com>**, or visit the **Comments** section on the ThemeForest item page.

* Include your **Envato purchase code**, a clear description of the issue, and steps to reproduce.
* Screenshots, your **Node.js version**, and any terminal error output speed up resolution.

We typically respond within **24–48 business hours (Monday–Friday)**.

## 🐞 Reporting Issues

## Describe the expected and actual behavior

Include what you expected to happen versus what actually happened.

## Include the exact error message

Copy the full terminal or console output.

## Share your environment

Include your OS, Node version, and browser.

## Test on a fresh install

Confirm whether the issue reproduces on a **fresh install** (`npm install` on the unmodified template).

## ⚠️ Scope of Support

Per Envato's standard policy, every purchase includes **6 months of item support**.

Support **covers**:

* ✅ Answering questions about how the template works.
* ✅ Setup help and bugs/defects in the template as shipped.
* ✅ Guidance on the documented customization points.
* ✅ Updates to keep the item working with the latest stack versions.

Support does **not** cover:

* ❌ Custom feature development or third-party integrations.
* ❌ Backend/API implementation (this is a **UI-only** template).
* ❌ Bugs introduced by heavy modification of the source.
* ❌ Installation or configuration of unrelated tools.

See Envato's [Item Support Policy](https://themeforest.net/page/item_support_policy) for full details.

## 🔄 Free Lifetime Updates

Updates are **free for life**, independent of your support period. Update notes are published on the **Changelog** page (`/changelog`) and through your Envato **Downloads** page — re-download the latest version anytime to get fixes and improvements.

## 💜 Thank You

We genuinely appreciate your support. A rating or review on the marketplace helps us keep improving **Tapotik AI**. Happy building!
