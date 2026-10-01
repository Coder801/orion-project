---
name: refactor
description: Guided workflow for refactoring existing code safely — graph-based impact analysis, delegated implementation, verification, and review. Use when the user asks to refactor, rename, restructure, extract, or otherwise significantly change code that already exists (not for writing new features from scratch).
---

Refactoring is riskier than adding new code — the goal here is to see the blast radius before touching anything, then verify nothing broke after.

## 1. Impact analysis (graphify)

Make sure the knowledge graph is current, then orient with it:

```bash
npm run graph:update                   # refresh graphify-out/ from the current code (no LLM needed)
graphify affected "<file-or-symbol>"   # reverse traversal — what depends on this, i.e. what can break
graphify god-nodes                     # most-connected files — extra caution if the target is one of these
graphify query "how is <X> used across the codebase"
graphify path "<A>" "<B>"              # relationship between two modules, if the refactor touches both
```

If `graphify-out/graph.json` doesn't exist yet, build it with `npm run graph:build`. If graphify isn't installed, fall back to `Grep`/`Explore` and mention that.

Use the result to scope the refactor: list the files/call sites that will need to change, and flag anything highly connected (god node) as higher-risk before proceeding.

## 2. Delegate the implementation

Hand the code changes to `frontend-developer` for UI/component work, or `backend-developer` for the mock layer, Redux slices, `proxy.ts` and server config — pass the list of affected files/call sites from step 1 so it doesn't have to rediscover them. For large or logically independent groups of changes, split into parallel agent calls per group.

## 3. Verify

```bash
npm run lint
npm run typecheck
npm run build
```

There is no automated test suite yet — for behavior-sensitive refactors, also check the affected pages with `npm run dev` (in both `ru` and `en`, and both themes where relevant). A refactor that leaves lint, types or the build red isn't done.

## 4. Review

Delegate to `code-reviewer` for a pass over the diff, specifically checking that the refactor didn't change behavior and didn't leave dead code (old exports, unused helpers, unused i18n keys) behind.

## 5. Refresh the graph

```bash
npm run graph:update
```

## Notes

- Do not commit — the user commits manually and splits commits by change type.
- If step 1 surfaces more affected files than expected, stop and confirm scope with the user before proceeding rather than silently expanding the change.
