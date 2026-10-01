---
name: build
description: Build the project for production. Use when the user asks to build the app, verify it compiles/typechecks for production, or says things like "build the project", "check the production build".
---

Build for production:

```bash
npm run build   # next build (Turbopack), includes TypeScript checking
```

- Use `npm start` (`next start`, http://localhost:3000) to serve the production build locally afterwards.
- `next build` does not run ESLint — run the `lint` skill separately.
