# CV model refactor — implementation PRD

A self-contained brief for the CV content-model refactor. It carries every decision reached in design, the concrete structures, the module plan, and the testing plan, so the work can be picked up in a fresh conversation without re-deriving anything.

Authoritative decisions live in [ADR-010](../decisions/ADR-010-content-decoupled-from-presentation.md), [ADR-011](../decisions/ADR-011-descriptor-driven-sync-tree.md), the [ADR-006](../decisions/ADR-006-export-import-schema-as-dto.md) update, and the [glossary](../../CONTEXT.md). This document is the spec those decisions point at. Use the glossary's vocabulary throughout.

## Problem Statement

The runtime `CV` model only covers a handful of resume fields and bakes presentation into the data. Its blocks (`CVBlocks`) are nine fixed, visually-shaped sections, and a single `Block<T>` is simultaneously a content grouping, a rendered section, and the atomic unit of hide / hash / sync. Because of that coupling:

- Most of JSON Resume's fields cannot be stored, so exports drop data and imports lose detail.
- Adding any new section means hand-editing six files (`diff`, `apply`, `hash`, `preprocess`, `present`, the editor) and the sync engine is hard-capped at two levels of nesting.
- The sync view's labels are hard-coded, blocking i18n and readable breadcrumbs.
- The root of the model is bloated with flat basics fields rather than grouped.

## Solution

Split the model into a strongly-typed, presentation-free **content** shape grouped into JSON-Resume-aligned sections, and move all sync traversal onto a generic engine that walks a **descriptor**-projected tree. The content model stays simple and hand-written; the sync feature owns the descriptor, the projection, and the generic diff/apply. Presentation (block order, on-page grouping, layout, styling) leaves the model entirely.

This is delivered in two steps on one branch:

- **Step 1 (this PRD):** the **complete** content model — every JSON Resume section and field — plus the descriptor-driven sync engine, the migrated serialization layer at JSON schema `v0.1.0`, a database wipe, and a _minimal_ editor port that keeps the app building, running, exporting, and syncing with tests green. The whole model is ready before the editor redesign; the refactor is done as if the editor already supported every field.
- **Step 2 (later, same branch, not this PRD):** the editor redesign (left editor pane / right styling+layout sidebar, entry dialogs), presentation and layout settings, and the **editor UI and PDF rendering** for the sections that had no editor before (volunteer, awards, certificates, publications, languages, interests, references, photo). These sections already exist in the model and round-trip through export/import and sync from step 1; step 2 only gives them surfaces.

## User Stories

1. As a job seeker, I want my full name, job title, location, summary, and highlights grouped under one "basics" section, so that the model mirrors how a resume actually reads.
2. As a job seeker, I want a real summary field alongside my highlights, so that I can keep a prose summary and a bullet list without one overwriting the other.
3. As a job seeker, I want my highlights to keep driving the editor for now, so that nothing about my current editing flow regresses while the summary field waits for its editor.
4. As a job seeker, I want typed email, phone, and website contacts plus a list of profiles, so that my contacts export losslessly to any JSON Resume tool.
5. As a job seeker, I want custom contact types (Mastodon, Telegram, and so on) to survive as profiles, so that I keep the free-form flexibility I had before without a lossy stash.
6. As a job seeker with a career gap or freelance period, I want a work entry's employer to be any text (not "company"), so that I can record "Freelance" or "Parental leave" honestly.
7. As a job seeker, I want each work entry to carry location, url, summary, highlights, and keywords, so that I can describe a role completely.
8. As a job seeker, I want education entries to split study type and area and to hold score, courses, and a url, so that my education matches the JSON Resume shape.
9. As a job seeker, I want skill categories to carry an optional level, so that I can express proficiency.
10. As a job seeker, I want my CVs to export to standard JSON Resume and re-import without losing my highlights, so that round-tripping is safe.
11. As a job seeker, I want exporting to lossless HumbleHire JSON to keep every field as first-class data, so that backups are exact.
12. As a job seeker importing a foreign JSON Resume that only has a summary, I want that summary turned into highlights, so that the content shows up in my highlights-driven editor.
13. As a job seeker tailoring a CV, I want to accept or discard each changed field of a job independently, so that I can take the master's new title but keep my tailored summary.
14. As a job seeker, I want a discarded change to stay discarded until the master changes that field again, so that I am not re-prompted for decisions I already made.
15. As a job seeker, I want a hidden section that the master changed to show its changes the moment I unhide it, so that hiding while drafting never silently swallows updates.
16. As a job seeker, I want to hide whole sections (and, later, individual entries) without deleting their content, so that I can shape a tailored copy or park a section while drafting.
17. As a job seeker, I want the sync view to show a readable breadcrumb for each change, so that I know exactly which entry and field a change belongs to.
18. As a job seeker, I want the "updates available" badge to stay accurate and cheap, so that the dashboard reflects real master changes without lag.
19. As a maintainer, I want one descriptor to drive diff, apply, labels, and breadcrumbs, so that adding a section later touches one declarative place instead of six files.
20. As a maintainer, I want a coverage test that fails when a content field has no descriptor node, so that a field can never silently fall out of sync.
21. As a maintainer, I want the content model free of presentation and sync machinery, so that the type the editor binds to stays simple.
22. As a maintainer, I want the sync engine to recurse arbitrary depth, so that deeper Axis B sections work without relaxing a depth cap by hand.
23. As a maintainer, I want the serialization mapper to thin toward identity, so that the wire format and the model drift apart as little as possible.
24. As a job seeker, I want my volunteer experience stored with the same shape as work, so that unpaid roles are first-class on my record.
25. As a job seeker, I want awards, certificates, and publications stored, so that my full professional record survives export and sync even before they have editors.
26. As a job seeker, I want languages and interests stored, so that a complete JSON Resume imports without dropping sections.
27. As a job seeker, I want references stored, so that I can keep them on the master and hide them on tailored copies.
28. As a job seeker, I want projects to carry roles, entity, and type, so that project entries match JSON Resume fully.
29. As a job seeker, I want a photo URL on basics, so that imported resumes that carry an image are not silently stripped.
30. As a job seeker, I want every section I cannot yet edit in the UI to still round-trip through HumbleHire JSON export, import, and master sync, so that no data is lost while the editors are being built.

## Implementation Decisions

### The four representations

A CV exists in four shapes, kept conceptually distinct (see glossary): **Stored CV**, **Runtime CV**, **Sync tree**, **Document**. Stored and Runtime are identical for now and may diverge later (for example, to keep recomputed data out of storage). No code generation links them; three deliberate artifacts (the `CVContent` type, the descriptor, the JSON schema) are bound by tests, not codegen.

### Content model (Runtime / Stored CV)

Strongly typed, presentation-free. Indicative shape (names are decisions, not the surrounding boilerplate):

```ts
interface CV {
	id: string;
	name: string; // the document's own name
	company?: string;
	createdAt: number;
	updatedAt: number;
	content: CVContent; // pure resume data
	hidden: string[]; // addresses: section paths now, entry objectIds later
	sourceId?: string; // set on a tailored CV
	baseline?: CVContent; // snapshot of master content at last sync (stored)
	hashes: SectionHashes; // derived cache, refreshed at the write chokepoint
	baselineHashes?: SectionHashes;
}

// The full JSON Resume section set lands in step 1. Editors and PDF rendering for
// the sections not previously present arrive in step 2; the model, descriptor,
// sync, and serialization cover all of them now.
interface CVContent {
	basics: Basics;
	work: WorkEntry[];
	volunteer: VolunteerEntry[];
	education: EducationEntry[];
	awards: AwardEntry[];
	certificates: CertificateEntry[];
	publications: PublicationEntry[];
	skills: SkillCategory[];
	languages: LanguageEntry[];
	interests: InterestEntry[];
	references: ReferenceEntry[];
	projects: ProjectEntry[];
}

interface Basics {
	fullName: string; // JSON Resume basics.name
	position: string; // basics.label
	image?: string; // URL to a photo (basics.image)
	location: string; // kept a plain string deliberately
	summary: string; // reserved; highlights drives the UI for now
	highlights: StringEntry[];
	email: string;
	phone: string;
	url: string;
	profiles: Profile[]; // custom labels live in `network`
}

interface WorkEntry extends WithId {
	name: string; // employer/entity; may be "Freelance", a gap, etc.
	position: string;
	location?: string;
	description?: string; // e.g. "Social Media Company" (work[].description)
	url?: string;
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	summary?: string;
	highlights: StringEntry[]; // was achievements
	keywords: StringEntry[]; // was skills tags
}

interface VolunteerEntry extends WithId {
	organization: string;
	position: string;
	url?: string;
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	summary?: string;
	highlights: StringEntry[];
}

interface EducationEntry extends WithId {
	institution: string;
	url?: string;
	studyType?: string;
	area?: string; // was a single `degree`
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	score?: string;
	courses: StringEntry[];
}

// Single-date sections — one date, no range, no `current` flag.
interface AwardEntry extends WithId {
	title: string;
	date?: Date;
	awarder?: string;
	summary?: string;
}

interface CertificateEntry extends WithId {
	name: string;
	date?: Date;
	url?: string;
	issuer?: string;
}

interface PublicationEntry extends WithId {
	name: string;
	publisher?: string;
	releaseDate?: Date;
	url?: string;
	summary?: string;
}

interface SkillCategory extends WithId {
	name: string;
	level?: string;
	keywords: StringEntry[]; // was skills
}

interface LanguageEntry extends WithId {
	language: string;
	fluency?: string;
}

interface InterestEntry extends WithId {
	name: string;
	keywords: StringEntry[];
}

interface ReferenceEntry extends WithId {
	name: string;
	reference: string;
}

interface ProjectEntry extends WithId {
	name: string;
	description: string;
	url?: string;
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	highlights: StringEntry[];
	keywords: StringEntry[]; // keywords was stack
	roles: StringEntry[]; // projects[].roles
	entity?: string; // projects[].entity
	type?: string; // projects[].type, e.g. "application", "talk"
}

interface Profile extends WithId {
	network: string;
	username?: string;
	url: string;
}
interface StringEntry extends WithId {
	value: string;
} // id-bearing internally, plain string[] on the wire
```

- The new sections (`volunteer`, `awards`, `certificates`, `publications`, `languages`, `interests`, `references`) and the extra fields (`basics.image`, `work.description`, `projects.roles`/`entity`/`type`) are modelled, described, synced, and serialized in step 1; only their editor UI and PDF rendering wait for step 2.
- `highlights`, `keywords`, `courses`, `roles` are id-bearing `StringEntry` internally so the engine matches them by id; they serialize to `string[]`.
- `hidden` holds **addresses**: a section path (`"work"`, `"basics.location"`) today; an entry `objectId` later for entry-level hiding, with no model change.
- `hashes`/`baselineHashes` are derived per **section**, recomputed only through a single content-write chokepoint so they cannot drift from `content`.

### Descriptor and Sync tree (sync engine)

A static `NodeDescriptor` tree mirrors `CVContent`. It carries shape and display text, **no values**.

```ts
type NodeDescriptor =
	| { kind: 'scalar'; label: string; type: 'text' | 'date' | 'bool' }
	| { kind: 'object'; label: string; fields: Record<string, NodeDescriptor> }
	| {
			kind: 'list';
			label: string;
			itemLabel: string;
			itemValueLabel?: string;
			entry: ObjectDescriptor;
	  };
```

- `label` names the list/section; `itemLabel` is the singular noun for an added/removed entry ("Role", "Skill"); `itemValueLabel` is the field whose value titles a specific entry (`name` -> "Acme"), optional with a first-non-empty-scalar fallback. These three replace the hard-coded `BLOCK_LABELS` / `FIELD_LABELS` / `ENTRY_NOUNS` / `entryTitle`.
- `project(cv)` walks the descriptor and the CV in lockstep to produce the Sync tree. The Runtime CV never imports the tree.

### Paths and the universal resolver

```ts
type Segment = { field: string } | { id: ObjectId };
type Path = Segment[];
```

- Segments are tagged so they self-narrow and serialize cleanly into `hidden` keys and decision keys.
- `resolve(content, path)` is one descriptor-guided walk that replaces `findEntry` / `findNestedEntry` / `findParentEntry`. At each step a `step(seg, node)` helper packs the pair into a discriminated `{ kind: 'object' | 'list', ... }` so casts stay confined to that helper. Object context consumes a `field`; list context consumes an `id` (matched by `objectId`, never by index). Depth is arbitrary.

### Diff items (per-field, path-addressed)

```ts
type DiffItem =
	| { change: 'modified'; path: Path; before: Scalar; after: Scalar } // path -> a scalar
	| { change: 'added' | 'removed'; path: Path }; // path -> a list entry
```

- `modified` always ends at a scalar; `added`/`removed` always end at a list-entry id. An object is never itself a change unit. A job with three changed fields yields three items.
- Decisions key by path. The breadcrumb is the descriptor labels along the path (entry crumbs via `itemValueLabel`).

### Baseline advancement

Per resolved item, not all-or-nothing:

| change            | discard                     | accept                                               |
| ----------------- | --------------------------- | ---------------------------------------------------- |
| modified (scalar) | `baseline[path] = master`   | `baseline[path] = master`; `tailored[path] = master` |
| added (entry)     | add to `baseline` only      | add to `baseline` and `tailored`                     |
| removed (entry)   | remove from `baseline` only | remove from `baseline` and `tailored`                |

Resolving reconciles the baseline to the master at that path; accept additionally reconciles the tailored CV. Unresolved items leave the baseline untouched. A hidden section produces no items, so its baseline never advances; its master changes surface honestly on unhide. There is no separate persisted decisions store — the baseline is the durable memory of decisions; the drawer's map is in-session only.

### Hashing and detection

Per-section canonical hash, computed from `content` (reuse the existing canonical-JSON approach, ids included). `hasUpdatesAvailable` compares master section hashes against the tailored baseline hashes, skipping sections hidden on either side. Known accepted wart: a hidden basics field that is the sole change can light the badge with an empty drawer, since hashes are per section not per field.

### Serialization (Document DTO, JSON schema v0.1.0)

- `meta.humblehire` is a general wildcard for values a target format cannot represent losslessly, not a contacts-specific stash. The contacts stash is removed (typed contacts round-trip through standard fields).
- HumbleHire JSON keeps extensions first-class (`basics.highlights`, `work[].keywords`), no stash.
- Plain JSON Resume folds highlights (and a set summary) into the standard `summary` string and stashes the originals in `meta` for exact round-trip. Importing our own plain file prefers `meta`; importing a foreign file with only `summary` splits it into highlights (temporary, removed when the summary editor lands).
- Temporal coercions are essentially emptied: split `studyType`/`area` and typed contacts become identity; `location` string<->object reclassifies to a durable coercion.
- JSON schema bumps to a new frozen file `v0.1.0.json`; `document.generated.ts` is regenerated from it (per ADR-009). No `v0.0.1` compatibility shim.
- The mapper covers **all** sections now. The new sections map to their standard JSON Resume keys as near-identity (`volunteer`, `awards`, `certificates`, `publications`, `languages`, `interests`, `references`, `projects.roles`/`entity`/`type`, `basics.image`). String-lists (`volunteer[].highlights`, `interests[].keywords`, `projects[].roles`) serialize to `string[]`; single dates (`awards[].date`, `certificates[].date`, `publications[].releaseDate`) use the `iso8601` text form.
- Because the model now holds every JSON Resume section, the old `unmappedSections` "dropped on import" behaviour goes away — foreign sections are imported, not discarded. The only fields still dropped are ones outside the JSON Resume schema entirely.

### Persistence

Bump the Dexie version and **wipe** — no `upgrade()`. One-time exception justified by pre-launch status; do not generalize (see the ADR-010 consequence and the project memory note).

### Editor port (minimal)

Rewire existing consumers only as far as keeps the build and tests green: block components bind to plain content fields and toggle a section path in `hidden` instead of pushing a block `objectId`; `preprocess`, the classic theme formatter, `create`, `create-tailored`, the dev dummy CV, and fixtures move to `content`. Rough breadcrumbs are acceptable in step 1. The faithful editor redesign and the new-field editors are step 2.

## Modules

Deep modules to build or rewrite, each with a small interface that rarely changes and is testable in isolation:

- **Content model** — the types above. Foundational, no logic.
- **Descriptor** — the `NodeDescriptor` tree and the `CV_DESCRIPTOR` constant, covering all twelve sections. Single source of structure and labels.
- **Resolve / project** — `resolve(content, path)`, `project(cv)`, `step(seg, node)`. Generic traversal; the deepest, most-tested unit.
- **Diff** — `diffCVs(master, tailored)` over projected trees; three-way, per-field, path-addressed.
- **Apply** — `applySyncDecisions(tailored, master, decisions)`; per-item baseline advancement; path-based mutation.
- **Hash** — `computeHashes(content)` per section; canonical and stable.
- **Detection** — `hasUpdatesAvailable(master, tailored)` over section hashes, skipping hidden.
- **Present** — breadcrumb and description from descriptor plus path.
- **Serialization mapper** — `toDocument` / `fromDocument` / `toJsonResume`, the `meta` wildcard, near-identity field mapping across all twelve sections (foreign sections are imported, not dropped).
- **Path utils** — canonical path-string encoding shared by `hidden` keys and diff decision keys.
- **Persistence / creation** — Dexie version bump and wipe; `createCV` and `createTailoredCV` content defaults and baseline cloning.
- **Editor port** — block components and other consumers, minimal.

## Testing Decisions

A good test here asserts external behavior, not internals: given specific master / tailored / baseline inputs, assert the diff items, the applied result, the round-trip equality, or the interop verdict — never the shape of an intermediate tree.

Prior art already in the repo to mirror: `diff.test.ts`, `apply.test.ts`, `detection.test.ts`, `hash.test.ts`, `locate.test.ts`, `present.test.ts` (tailoring), `serialize.test.ts`, `parse.test.ts`, `import.test.ts`, and the node-environment interop guard `jsonresume-compat.test.ts`. Shared fixtures live in `_fixtures.ts` and `__fixtures__/complete-cv.ts`.

Modules to cover:

- **Resolve / project** — round-trip a path to a value and back; entries located by id under reordering; arbitrary depth.
- **Diff** — three-way cases per change kind; per-field granularity (three changed fields produce three items); order-agnostic list matching; hidden sections excluded.
- **Apply** — per-item baseline advancement for accept and discard across modified/added/removed; mixed-origin entries; hidden-section baseline left untouched, then surfacing on unhide.
- **Hash / detection** — stable hashes; badge true only on real, non-hidden master changes.
- **Serialization** — HumbleHire JSON round-trip identity over a complete-CV fixture that populates **all twelve sections** (so the new sections are covered); plain JSON Resume highlights/summary folding and `meta` recovery; foreign-summary split; a foreign JSON Resume carrying volunteer/awards/etc. imports those sections instead of dropping them; validation against the bundled JSON Resume schema (keep the ADR-008 interop guard passing at v0.1.0).
- **Descriptor coverage** — every `CVContent` field is reachable from `CV_DESCRIPTOR`; fails when a field has no node.

## Out of Scope

- The editor redesign, entry dialogs, the styling/layout sidebar, and presentation/order settings (step 2).
- **Editor UI and PDF rendering** for the sections that had no surface before — volunteer, awards, certificates, publications, languages, interests, references, and the basics photo. The model, descriptor, sync, and serialization for these land in step 1; only their editors and theme rendering are step 2. (This is the correction to the earlier "Axis B is deferred" framing: only the _surfaces_ are deferred, not the model.)
- A live summary editor (the field exists, highlights drives the UI).
- A database migration (deliberate wipe) and any `v0.0.1` import compatibility shim.
- Entry-level and field-level hiding UI (the `hidden` address set already supports it; only section hiding ships now).
- i18n (the descriptor is the seam; no translation layer yet).

## Further Notes

- Keep the content model free of presentation and of sync machinery; `hidden`, `baseline`, and the hashes are siblings of `content`, never inside it.
- Mutate `content` only through one chokepoint that refreshes hashes, so the derived cache cannot drift.
- The mapper bridges two shapes by design even as names align; alignment is a convenience, not a reason to collapse Document and Runtime CV (ADR-006).
- "Block" is legacy in the content model. It survives only as a presentation term for step 2; the glossary flags the conflict.
