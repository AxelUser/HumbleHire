# ADR-013: Styling is a per-CV content sibling, excluded from sync

- **Status**: Accepted
- **Date**: 2026-06-07
- **Feature**: styling

---

A CV's presentation choices — selected template, colour palette, font, base size, density, and section order — are stored **per CV** as a `styling` field that is a sibling of `content`, never inside it, and are **excluded from sync**. This keeps `CVContent` presentation-free as [ADR-010](./ADR-010-content-decoupled-from-presentation.md) requires, and gives the resolved tokens consumed by [ADR-012](./ADR-012-templates-render-resolved-styling.md) a home.

## What changed

- The CV gains `styling`, alongside `hidden`, `baseline`, and `hashes`: `{ templateId, palette (accent/text/surface, or a preset id), font, baseSize, density, sectionOrder }`. It is **not** part of `CVContent`, so the sync descriptor never projects it and the diff never raises it.
- **Per-CV, not global.** Each CV carries its own styling; a tailored copy aimed at a different role may legitimately look different from its master.
- **Inherited once, then independent.** `createTailoredCV` copies the master's styling at creation, the same way it copies content. Later restyling of the master does not propagate — consistent with "tailored copies are independent after creation."
- **Backfilled, not wiped.** `styling` is new and optional, so existing stored CVs receive a default styling on read via a Dexie `upgrade`. Unlike the content-model bump ([ADR-010](./ADR-010-content-decoupled-from-presentation.md)), this change is purely additive and does not justify dropping the database.
- The user controls the palette through curated **presets** first; raw three-colour pickers sit behind an "Advanced" affordance. Muted text, hairlines, and on-accent/on-surface contrast are derived (see [ADR-012](./ADR-012-templates-render-resolved-styling.md)), never user-set.

## Why

Per-CV colours were the new requirement, and ADR-010 already forbids presentation inside `content`. The only consistent place for presentation state is a sibling of content, mirroring how `hidden` and the hash caches already sit. Keeping styling out of `CVContent` also keeps it out of sync for free: sync is defined as pulling **content** changes from a master, and a tailored copy's look is its own business — folding styling into the diff would force users to reconcile colour choices they never wanted treated as content.

## Consequences

- The "updates available" badge and the sync drawer ignore styling entirely; restyling a master never marks its tailored copies as out of date.
- Section order being part of `styling` (not `content`) means reordering a master's sections does not surface as a sync change on its copies, which is the intended behaviour.
- A future "apply the master's look to this copy" action, if ever wanted, would be a deliberate one-shot copy outside the sync path, not a diff item.
