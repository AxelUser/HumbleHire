# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the domain glossary. Use its terms; keep it current with `/grill-with-docs` as the vocabulary moves.
- **`docs/decisions/`** — read ADRs that touch the area you're about to work in before suggesting architecture changes.
- **`docs/reference/`** — concrete specs an ADR points to but is too detailed to hold (for example `serialization-schema.md`).

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

## Writing ADRs

One decision per file. If a draft covers two decisions, split it before committing.

Structure:

- Opening paragraph: state the decision in plain terms.
- `## Why not X` (or thematic equivalent): explain what was rejected and why.
- `## Consequences` (or thematic sections): rules and downstream effects that follow.

Style:

- No inline-header bullet lists (`**Label**: description`). Use prose or plain bullets.
- No em dashes. Use parentheses or a separate sentence instead.
- Direct technical language. No AI vocabulary: enhance, highlight, showcase, pivotal, underscore, testament, vibrant, landscape (figurative).
- Section headers in sentence case, not Title Case.
