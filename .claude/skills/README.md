# Skills

Project-local skills, one per directory (`<name>/SKILL.md`), each with YAML frontmatter (`name`, `description`) followed by the actual instructions/commands.

| Skill | Use for |
|---|---|
| `dev` | Launch the Next.js dev server (`npm run dev`, http://localhost:3000). |
| `lint` | Lint, typecheck and format (`npm run lint` / `typecheck` / `format:check` / `format`). |
| `build` | Production build (`npm run build`), serve with `npm start`. |
| `graphify` | Knowledge graph of the codebase (`npm run graph:build` / `graph:update`); query/path/explain/affected. |
| `refactor` | Refactor existing code safely: graphify impact analysis → `frontend-developer`/`backend-developer` edits → lint/typecheck/build → `code-reviewer`. |

Each `SKILL.md`'s `description` field is what the assistant matches against the user's request to decide whether to activate it — keep it specific and behavior-oriented (see existing files for the pattern) rather than editing this index when a skill's purpose changes.
