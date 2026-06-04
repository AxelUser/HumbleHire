# ADR-006: The export/import format is a DTO, not the runtime model

- **Status**: Accepted
- **Date**: 2026-06-03
- **Feature**: serialization

---

The wire format for CV export and import is a separate document DTO, not the runtime `CV`. Two functions, `toDocument(cv)` and `fromDocument(doc)`, are the only bridge between them. The concrete field mapping, extensions, and version rules live in the [serialization schema reference](../reference/serialization-schema.md); this ADR records why the two types are kept apart.

## Why not serialize the runtime model directly

The runtime `CV` and the export format have incompatible requirements.

`CV` feeds the diff/sync engine. That engine matches entries by `objectId`, hashes block values with ids included, expects all nine blocks present, and carries `Date` objects and explicit hidden-state flags. Those contracts are set by `diff.ts`, `apply.ts`, `hash.ts`, and `detection.ts`.

The document is read and edited by humans and LLMs and has to interoperate with the JSON Resume ecosystem. It uses JSON Resume vocabulary (`basics`, `work`, `keywords`), carries no machine ids, omits empty sections, follows JSON Resume idioms (an absent `endDate` for a current role rather than a `current` flag), and encodes dates as `YYYY-MM` text.

Serializing `CV` directly would push all of those format concerns into the type the sync core depends on. A DTO keeps them in the mapper, isolated and testable in both directions.

## Consequences

**Import always creates a new CV.** The document carries no `id` and no per-entry `objectId`. `fromDocument` mints fresh ids, recomputes hashes, and links nothing back. A file exported and re-imported is a new standalone CV with the same content. In-place update and identity round-trip are out of scope for this version.

**Version gating belongs to the document.** The JSON schema version is checked on import: a version higher than the app supports is rejected, missing or equal is accepted, and unknown keys are ignored. The reader accepts any valid JSON Resume document, not only HumbleHire exports. The exact rules are in the [reference doc](../reference/serialization-schema.md).

**The runtime model can change independently.** A planned model refactor (a future ADR) will align `CV` field names with JSON Resume vocabulary. When it lands the mapper simplifies but does not disappear: the document stays id-less and human-shaped, and `CV` stays id-bearing and engine-shaped. Name alignment is a mapper convenience, not a reason to collapse the two types.

## Temporal vs durable coercions

The mapper bridges two shapes, and the conversions split into two kinds that must stay separable in the code.

**Durable** conversions are the permanent gap between an engine-shaped `CV` and a human-shaped document, and they outlive the refactor: the highlights list to and from a `summary`, the `keywords` and project `stack` extensions, `Date` to and from `YYYY-MM`, `current` to and from an absent `endDate`, and the DTO boundary itself (strip ids, omit empty sections, drop hidden blocks).

**Temporal** conversions exist only because the current `CV` is shaped differently from the wire: location, degree, and contacts, plus the `meta` stash that backs them. The planned refactor makes `CV` adopt JSON Resume's structures, at which point these collapse to identity and are removed. They carry a grep-able `@temporal-coercion` marker, so a future reader removing them follows the marker rather than gutting the mapper.

The [reference doc](../reference/serialization-schema.md) spells out each conversion and the foreign sections dropped on import.
