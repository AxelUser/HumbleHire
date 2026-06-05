# Serialization schema reference

The concrete export/import schema for HumbleHire. The decision to keep this format separate from the runtime `CV` is recorded in [ADR-006](../decisions/ADR-006-export-import-schema-as-dto.md); this document is the spec that decision points to.

Current JSON schema version: **0.0.1**.

## Formats

Two export variants, one import path:

- **HumbleHire JSON** (`.humblehire.json`) — JSON Resume superset, lossless. `$schema` points at the published HumbleHire superset schema. Used for round-trip backup/restore and LLM-assisted editing.
- **JSON Resume** (`.json`) — plain JSON Resume, lossy interop. `$schema` points at the official JSON Resume schema. Contacts and highlights are projected onto the standard fields; HumbleHire extensions are omitted.
- **Import** accepts either. It prefers HumbleHire extensions when present and falls back to JSON Resume fields for foreign files.

## Field mapping

| Document field                                  | Runtime model field                             | Notes                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `basics.name`                                   | `blocks.fullName.value`                         |                                                                                                           |
| `basics.label`                                  | `blocks.position.value`                         | JSON Resume `label` is the job title                                                                      |
| `basics.highlights`                             | `blocks.highlights.value[].text`                | HumbleHire extension; absent in JSON Resume export                                                        |
| `basics.summary`                                | —                                               | JSON Resume export only: highlights joined by `\n`; on import, split by newlines into the highlights list |
| `basics.location.address`                       | `blocks.location.value`                         | Free string packed into `address` on export; joined back on import                                        |
| `basics.email/phone/url/profiles`               | `blocks.contacts.value`                         | See contacts below                                                                                        |
| `meta.humblehire.contacts`                      | `blocks.contacts.value`                         | HumbleHire extension; exact `{label, value}` stash for lossless round-trip                                |
| `work[].name`                                   | `blocks.jobHistory.value[].company`             | JSON Resume calls the employer `name`; the model keeps `company`                                          |
| `work[].position`                               | `blocks.jobHistory.value[].role`                |                                                                                                           |
| `work[].startDate` / `work[].endDate`           | `blocks.jobHistory.value[].startDate/endDate`   | `YYYY-MM` text on the wire, `Date` in the model; absent `endDate` encodes `current: true`                 |
| `work[].highlights`                             | `blocks.jobHistory.value[].achievements[].text` |                                                                                                           |
| `work[].keywords`                               | `blocks.jobHistory.value[].skills[].value`      | HumbleHire extension                                                                                      |
| `education[].institution`                       | `blocks.education.value[].institution`          |                                                                                                           |
| `education[].studyType`                         | `blocks.education.value[].degree`               | Single string; JSON Resume splits `studyType` + `area`, the model does not                                |
| `education[].startDate` / `education[].endDate` | `blocks.education.value[].startDate/endDate`    | Same date encoding as work                                                                                |
| `skills[].name`                                 | `blocks.skills.value[].name`                    |                                                                                                           |
| `skills[].keywords`                             | `blocks.skills.value[].skills[].value`          |                                                                                                           |
| `projects[].name`                               | `blocks.projects.value[].name`                  |                                                                                                           |
| `projects[].description`                        | `blocks.projects.value[].description`           |                                                                                                           |
| `projects[].keywords`                           | `blocks.projects.value[].stack[].value`         | HumbleHire extension                                                                                      |
| `projects[].url`                                | `blocks.projects.value[].link`                  |                                                                                                           |

## Extensions over JSON Resume

The HumbleHire JSON format adds three fields absent from the JSON Resume standard. JSON Resume uses `additionalProperties: true` throughout, so these pass standard schema validation.

1. **`basics.highlights`** — array of strings. The highlights block rendered as bullet points. Absent from the JSON Resume export, where the summary is used instead.
2. **`work[].keywords`** — array of strings. Technologies and skills used in the role. Absent from the JSON Resume standard's `work` items.
3. **`meta.humblehire`** — object. Carries `schemaVersion` for version gating and `contacts` for lossless round-trip.

## Version gating

The reader checks `meta.humblehire.schemaVersion` when present. A version higher than the app supports is rejected with an error. Missing or equal is accepted. Unknown keys are ignored regardless of version. Additive schema changes stay forward- and backward-compatible under these rules.

## Round-trip adapter notes

Three fields in the current model do not map cleanly onto JSON Resume shapes. The mappers bridge them with best-effort conversions that round-trip own-generated files exactly but may lose precision on foreign JSON Resume documents. These are the **temporal** coercions from [ADR-006](../decisions/ADR-006-export-import-schema-as-dto.md), marked `@temporal-coercion` in the code; the planned model refactor removes them.

**Location** — the model holds a single free-text string; JSON Resume `location` is an object `{address, city, postalCode, region, countryCode}`. Export: string into `location.address`. Import: take `address` as-is when present; join `city`/`region`/`countryCode` with ", " when `address` is absent (the foreign-file path). Own files always have `address`, so the round-trip is exact.

**Degree** — the model holds a single string (for example "BSc Computer Science"); JSON Resume splits this into `studyType` and `area`. Export: string into `studyType`. Import: read `studyType`; if absent, read `area`; if both are present, join with " " (foreign-file path). Own files always have `studyType`, so the round-trip is exact.

**Contacts** — the model holds generic `{label, value}` pairs; JSON Resume exposes typed top-level fields (`email`, `phone`, `url`) and `profiles[]`. Export (HumbleHire JSON): emit standard fields by heuristic and stash the exact array in `meta.humblehire.contacts`. Import: prefer `meta.humblehire.contacts` when present (own file, exact); otherwise reconstruct from standard fields (foreign file, heuristic: `email` → `{label:"Email"}`, `phone` → `{label:"Phone"}`, `url` → `{label:"Website"}`, each `profiles[]` entry → `{label: network, value: url}`). Export (JSON Resume): heuristic only, no stash, so contact labels are lost.

## Durable vs temporal

The round-trip notes above are **temporal**: the planned model refactor makes `CV` adopt JSON Resume's structures (a structured `location`, a split `studyType`/`area`, typed contacts), and these conversions then collapse to identity. The `meta.humblehire.contacts` stash exists only because arbitrary labels cannot round-trip through typed fields, and it goes with them.

The rest of the mapper is **durable** and survives that refactor:

- highlights list to and from `summary` — JSON Resume has no bullet list, so this is a lossy projection on export and a summary-split on foreign import.
- `work[].keywords` and project `stack` as extensions — absent from the JSON Resume standard.
- `Date` to and from `YYYY-MM`, and `current` to and from an absent `endDate` — the engine keeps `Date` objects and an explicit `current` flag.
- strip ids, omit empty sections, drop hidden blocks — the DTO boundary itself.

Foreign sections HumbleHire has no block for (awards, languages, volunteer, references, certificates, and so on) are dropped on import. A pure `unmappedSections(doc)` inspector names them so the import surface can warn.
