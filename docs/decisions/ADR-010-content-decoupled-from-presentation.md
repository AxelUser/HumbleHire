# ADR-010: CV content is decoupled from presentation

- **Status**: Accepted
- **Date**: 2026-06-06
- **Feature**: model

---

The runtime `CV` is restructured so that **content** (the resume data) carries no presentation. The old `CVBlocks` made one `Block<T>` do three unrelated jobs at once — a content grouping, a rendered section, and the atomic unit of hide / hash / sync — and froze the model into nine fixed, presentation-shaped blocks. This refactor pulls those jobs apart. It is the model refactor [ADR-006](./ADR-006-export-import-schema-as-dto.md) anticipated as "a future ADR."

## What changed

- The CV holds a strongly-typed, presentation-free `content: CVContent`, grouped into typed sections covering the full JSON Resume section set (`basics`, `work`, `volunteer`, `education`, `awards`, `certificates`, `publications`, `skills`, `languages`, `interests`, `references`, `projects`) whose vocabulary tracks JSON Resume so the serializer thins toward identity. The whole model lands in one step; sections without an editor yet still round-trip through serialization and sync. Block order, on-page grouping, and layout are **not** in the model — they are presentation concerns that live with the theme/layout, decided per render, not stored on the content.
- **Four representations** of a CV are named and kept conceptually distinct (see [CONTEXT.md](../../CONTEXT.md)): the **Stored CV**, the **Runtime CV**, the **Sync tree** (see [ADR-011](./ADR-011-descriptor-driven-sync-tree.md)), and the **Document** DTO ([ADR-006](./ADR-006-export-import-schema-as-dto.md)). Stored and Runtime are identical today but may diverge — e.g. to keep recomputed fields out of storage.
- **Hide-state** becomes `hidden: string[]`, a set of _addresses_ — a section path (`work`, `basics.location`) now, an entry `objectId` when entry-level hiding ships — replacing the per-block `objectId` list. Hiding is a general drafting _and_ tailoring concern, not tailoring-only.
- **Sync machinery** (`baseline`, hashes) are stored _siblings_ of `content`, never nested inside it, so `CVContent` stays a pure description of the resume. Hashes are a derived cache refreshed at a single content-write chokepoint, which keeps them from drifting against their source.

## Why

Presentation coupling was the thing blocking the model from holding the full JSON Resume field set: every new section meant a new visually-shaped block wired through six files. Decoupling lets a new section be "add a typed array plus a descriptor entry," and lets grouping (`basics`) reduce root-level bloat without dictating layout.

## Consequences

- The "nine fixed blocks" concept and `Block<T>` retire from the content model. "Block" survives only as a _presentation_ term (a rendered section); the conflict is flagged in CONTEXT.md until the step-2 presentation design resolves it.
- The local IndexedDB is **wiped**, not migrated, on the version bump. The app is deployed but pre-launch with no active traffic, so the data-loss risk is theoretical, and a one-time `upgrade()` translating the dead `blocks` shape would be more lasting cruft than the migration is worth. This is an explicit, one-time exception to the durable-storage default and does not generalize.
