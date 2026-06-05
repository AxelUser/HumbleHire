# ADR-011: Sync diffs a descriptor-projected tree, not the typed model

- **Status**: Accepted
- **Date**: 2026-06-06
- **Feature**: tailoring

---

The tailoring engine no longer hand-walks the typed `CV`. The **Runtime CV** is projected one-way into a generic node tree defined by a static **descriptor**, and generic `diff` / `apply` / `locate` operate on that tree. The core content model never imports the tree; the dependency points one way only. This complements [ADR-010](./ADR-010-content-decoupled-from-presentation.md), which keeps the content model itself simple and strongly typed.

## What changed

- A `NodeDescriptor` tree (kinds: `object`, `list`, `scalar`) mirrors `CVContent`, holding **shape and display labels but no values**. It is the single source of every label and breadcrumb in the sync view, and the seam a future i18n layer swaps keys into.
- `project(cv)` walks the descriptor and the CV in lockstep to produce the **Sync tree**. A generic, recursive `resolve(content, path)` replaces the per-section `findEntry` / `findNestedEntry` / `findParentEntry` trio, and the old "max two levels deep" ceiling is gone.
- **Diff items are path-addressed and per-field.** A `modified` item ends at a single scalar (carrying before/after); an `added`/`removed` item ends at a list-entry id. Lists are matched by `objectId`, never by position, so diffs stay order-agnostic. A job with three changed fields yields three independently accept/discard-able items.
- **The baseline advances per resolved item.** Accept and discard both reconcile the baseline to the master at that path; accept additionally reconciles the tailored CV. Unresolved items leave the baseline untouched. A hidden section produces no items, so its baseline never advances — its master changes surface honestly the moment it is unhidden, for the user to decide. This removes the old all-or-nothing baseline snapshot.

## Why, and the alternative rejected

The hand-written engine enumerated nine block keys, knew exactly three nested lists, hard-coded every label in `present.ts`, and re-listed the same sections across `diff` / `apply` / `hash` / `preprocess`. Adding the JSON Resume sections the model now needs (volunteer, awards, certificates, …) would have multiplied that hand-work per section and broken the depth assumption.

The alternative — keep per-section logic and add cases — was rejected because it does not scale to that breadth and keeps the hard-coded label smell. The descriptor-driven engine trades compile-time exhaustiveness for uniform, recursive, breadth-cheap sync; the lost exhaustiveness is bought back with a coverage test asserting every `CVContent` field has a descriptor node, so a field can never silently fall out of sync.

## Consequences

- `present.ts`'s `BLOCK_LABELS` / `FIELD_LABELS` / `ENTRY_NOUNS` / `entryTitle` collapse into descriptor labels plus per-list `label` / `itemLabel` / `itemValueLabel` annotations. `locate.ts` collapses into `resolve`.
- Sync decisions key by path rather than `objectId`. The baseline _is_ the durable memory of decisions; there is no separate persisted decision store.
- The tree is intentionally loosely typed; casts are confined to the `resolve` step helper.
