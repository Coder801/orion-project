---
name: lint
description: Lint the source code and styles. Use when the user asks to lint, format, or auto-fix code style issues, or says things like "run lint", "format the code", "fix lint errors".
---

Lint, typecheck and format:

```bash
npm run lint           # ESLint (eslint-config-next + typescript rules)
npm run typecheck      # tsc --noEmit
npm run format:check   # Prettier check (incl. Tailwind class order)
npm run format         # Prettier --write
```

- If `typecheck` reports missing `PageProps` / `LayoutProps`, generate route types first: `npx next typegen`.
- Run `lint` and `typecheck` after making source changes and before considering a task done.
