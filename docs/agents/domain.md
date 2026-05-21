# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — this file does not exist yet. Create it with `/grill-with-docs` when you're ready to formalise the domain vocabulary. Until then, proceed silently.
- **`docs/decisions/`** — read ADRs that touch the area you're about to work in before suggesting architecture changes.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md               ← create when ready
├── docs/decisions/          ← ADRs live here (not docs/adr/)
│   ├── ADR-001-indexeddb-dexie.md
│   └── ADR-002-client-side-pdf-generation.md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR in `docs/decisions/`, surface it explicitly rather than silently overriding:

> _Contradicts ADR-002 (client-side PDF generation) — but worth reopening because…_
