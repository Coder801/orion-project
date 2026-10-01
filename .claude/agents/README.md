# Agents

Subagent definitions for this project. Invoke via the `Agent` tool with the frontmatter `name` as `subagent_type` (matches the filename for all of these).

| File | name (subagent_type) | Use for |
|---|---|---|
| `frontend-developer.md` | `frontend-developer` | React + Next.js + TypeScript + SCSS Modules — UI, components, client-side logic. |
| `backend-developer.md` | `backend-developer` | Mock API layer, Redux slices/thunks, `proxy.ts`, cookie persistence, next-intl server config, route handlers. |
| `code-reviewer.md` | `code-reviewer` | Read-only review — bugs, architecture, server/client boundaries, Tailwind tokens, i18n keys, a11y. |

Each file's own frontmatter (`description`, `tools`, `model`) is the source of truth for when the agent activates and what it can touch — this table is just an index.
