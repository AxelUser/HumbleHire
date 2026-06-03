# ADR-006: The export/import format is a DTO, not the runtime model

- **Status**: Accepted
- **Date**: 2026-06-03
- **Feature**: export/import

---

The wire format for CV export/import is a separate `CvDocument` DTO type. Two functions — `toDocument(cv)` and `fromDocument(doc)` — are the only bridge between it and the runtime `CV` model.

## Why not serialize the runtime model directly

The runtime `CV` and the export format have incompatible requirements.

`CV` feeds the diff/sync engine. That engine matches entries by `objectId`, hashes block values (ids included), expects all nine blocks present, and carries `Date` objects and explicit hidden state flags. Those contracts are defined by `diff.ts`, `apply.ts`, `hash.ts`, and `detection.ts`.

`CvDocument` is read and edited by humans or LLMs, and must interoperate with the JSON Resume ecosystem. It uses JSON Resume vocabulary (`basics`, `work`, `keywords`), carries no machine IDs, omits empty sections, follows JSON Resume idioms (absent `endDate` for current roles rather than a `current` flag), and encodes dates as `YYYY-MM` text.

Serializing `CV` directly would push all those format concerns into the type the sync core depends on. A DTO keeps them in the mapper, where they are isolated and testable in both directions.

## Consequences

**Import always creates a new CV.** `CvDocument` carries no `id` and no per-entry `objectId`. `fromDocument` mints fresh IDs, recomputes hashes, and links nothing back to an existing CV. A file exported and re-imported is a new standalone CV with the same content. In-place update and identity round-trip are out of scope for this version.

**Version gating belongs to the DTO.** `meta.humblehire.schemaVersion` is checked on import. A version higher than the app supports is rejected with an error. Missing or equal version is accepted. Unknown keys are ignored. The format accepts any valid JSON Resume document, not only HumbleHire exports. Additive schema changes stay forward- and backward-compatible under these rules.

**The runtime model can change independently.** The planned model refactor (separate ADR) will align `CV` field names with JSON Resume vocabulary. When that happens, the mapper simplifies — but is not removed. `CvDocument` stays ID-less and human-shaped; `CV` stays ID-bearing and engine-shaped. Name alignment is a mapper convenience, not a reason to collapse the two types.

## Schema specification (v0.0.1)

### Format

Two export variants, one import path:

- **HumbleHire JSON** (`.humblehire.json`) — JSON Resume superset, lossless. `$schema` points at the published HumbleHire superset schema. Used for round-trip backup/restore and LLM-assisted editing.
- **JSON Resume** (`.json`) — plain JSON Resume, interop/lossy. `$schema` points at the official JSON Resume schema. Contacts and highlights are projected onto the standard fields; internal extensions are omitted.
- **Import** — accepts either format. Prefers HumbleHire extensions when present; falls back to JSON Resume fields for foreign files.

### Field mapping

| Document field                                  | Runtime model field                             | Notes                                                                                                 |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `basics.name`                                   | `blocks.fullName.value`                         |                                                                                                       |
| `basics.label`                                  | `blocks.position.value`                         | JSON Resume `label` = job title                                                                       |
| `basics.highlights`                             | `blocks.highlights.value[].text`                | HumbleHire extension; absent in JSON Resume export                                                    |
| `basics.summary`                                | —                                               | JSON Resume export only: highlights joined by `\n`; on import, split by newlines into highlights list |
| `basics.location.address`                       | `blocks.location.value`                         | Free string packed into `address` on export; joined back on import                                    |
| `basics.email/phone/url/profiles`               | `blocks.contacts.value`                         | See contacts below                                                                                    |
| `meta.humblehire.contacts`                      | `blocks.contacts.value`                         | HumbleHire extension; exact `{label, value}` stash for lossless round-trip                            |
| `work[].name`                                   | `blocks.jobHistory.value[].company`             | JSON Resume calls the employer `name`; we keep `company` in the model                                 |
| `work[].position`                               | `blocks.jobHistory.value[].role`                |                                                                                                       |
| `work[].startDate` / `work[].endDate`           | `blocks.jobHistory.value[].startDate/endDate`   | `YYYY-MM` text on the wire, `Date` in the model; absent `endDate` encodes `current: true`             |
| `work[].highlights`                             | `blocks.jobHistory.value[].achievements[].text` |                                                                                                       |
| `work[].keywords`                               | `blocks.jobHistory.value[].skills[].value`      | HumbleHire extension                                                                                  |
| `education[].institution`                       | `blocks.education.value[].institution`          |                                                                                                       |
| `education[].studyType`                         | `blocks.education.value[].degree`               | Single string; JSON Resume splits `studyType` + `area`, but we don't                                  |
| `education[].startDate` / `education[].endDate` | `blocks.education.value[].startDate/endDate`    | Same date encoding as work                                                                            |
| `skills[].name`                                 | `blocks.skills.value[].name`                    |                                                                                                       |
| `skills[].keywords`                             | `blocks.skills.value[].skills[].value`          |                                                                                                       |
| `projects[].name`                               | `blocks.projects.value[].name`                  |                                                                                                       |
| `projects[].description`                        | `blocks.projects.value[].description`           |                                                                                                       |
| `projects[].keywords`                           | `blocks.projects.value[].stack[].value`         | HumbleHire extension                                                                                  |
| `projects[].url`                                | `blocks.projects.value[].link`                  |                                                                                                       |

### Extensions over JSON Resume

The HumbleHire JSON format adds three fields absent from the JSON Resume standard. JSON Resume uses `additionalProperties: true` throughout, so these fields pass standard schema validation.

1. **`basics.highlights`** — array of strings. The highlights block rendered as bullet points. Absent from the JSON Resume export (summary is used instead).
2. **`work[].keywords`** — array of strings. Technologies and skills used in the role. Absent from the JSON Resume standard's `work` items.
3. **`meta.humblehire`** — object. Carries `schemaVersion` for version-gating and `contacts` for lossless round-trip.

### Version gating

The reader checks `meta.humblehire.schemaVersion` when present. A version higher than the app supports is rejected with an error. Missing or equal version is accepted. Unknown keys are silently ignored regardless of version.

## Round-trip adapter notes

_This section documents workarounds for the gap between the current runtime model and the schema's vocabulary. It should be removed as part of the planned model refactor (separate ADR)._

Three fields in the current model do not map cleanly onto JSON Resume shapes. The mappers bridge them with best-effort conversions that round-trip own-generated files exactly but may lose precision on foreign JSON Resume documents.

**Location** — the model holds a single free-text string; JSON Resume `location` is an object `{address, city, postalCode, region, countryCode}`. Export: string → `location.address`. Import: take `address` as-is when present; join `city`/`region`/`countryCode` with ", " when `address` is absent (foreign file path). Own files always have `address`, so round-trip is exact.

**Degree** — the model holds a single string (e.g. "BSc Computer Science"); JSON Resume splits this into `studyType` and `area`. Export: string → `studyType`. Import: read `studyType`; if absent, read `area`; if both present, join with " " (foreign file path). Own files always have `studyType`, so round-trip is exact.

**Contacts** — the model holds generic `{label, value}` pairs; JSON Resume exposes typed top-level fields (`email`, `phone`, `url`) and `profiles[]` objects. Export (HumbleHire JSON): emit standard fields via heuristic _and_ stash the exact array in `meta.humblehire.contacts`. Import: prefer `meta.humblehire.contacts` when present (own file, exact round-trip); fall back to reconstructing from standard fields when absent (foreign file, heuristic: `email`→`{label:"Email",value}`, `phone`→`{label:"Phone",value}`, `url`→`{label:"Website",value}`, each `profiles[]` entry → `{label: network, value: url}`). Export (JSON Resume): heuristic only, no stash; contacts labels are lost.
