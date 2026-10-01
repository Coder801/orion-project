---
name: dev
description: Launch the Next.js development server for this project. Use when the user asks to run/start the app locally, verify a UI change in a browser, or says things like "start the dev server", "run the app", "open the app locally".
---

Start the local dev server:

```bash
npm run dev
```

- Runs `next dev` (Turbopack) — open [http://localhost:3000](http://localhost:3000); it redirects to `/ru` or `/en` based on the saved locale cookie or the browser language.
- Useful pages: `/en` (landing), `/en/auth/sign-in` (demo accounts listed there), `/en/app/dashboard`, `/en/admin/requests`, `/en/ui-kit`.
- Use this before manually verifying frontend/UI changes in a browser.
