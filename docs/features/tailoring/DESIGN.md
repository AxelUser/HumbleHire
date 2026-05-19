# DESIGN: Tailoring & versioning

Tailored CVs are regular CVs that remember where they came from. The whole feature boils down to: copy a CV, track the link, and let the user pull in changes later.

This builds on the [CV Editor](../cv-editor/DESIGN.md). Read that first if you haven't.

---

## Data model changes

All types live in `src/lib/types/cv.ts`.

### ObjectId

Every piece of data that might need to be compared across CVs gets a stable identifier. We use a branded type so the underlying representation can change later without touching call sites.

```ts
type ObjectId = string & { readonly __brand: 'ObjectId' };

function createObjectId(): ObjectId {
	return crypto.randomUUID() as ObjectId;
}
```

### Nested model with ObjectIds

The CV keeps its nested object structure -- blocks contain entry arrays, entries contain child arrays. Components bind to these objects directly through `$bindable()` props, which keeps the editor simple.

What changes: every piece of data that could differ between a master and a tailored CV gets an `ObjectId`. The diff functions match items across CVs by these ids.

Previously bare `string[]` fields (achievements, skills, highlights) become typed arrays where each item has its own `objectId`:

```ts
interface Achievement {
	objectId: ObjectId;
	text: string;
}

interface Highlight {
	objectId: ObjectId;
	text: string;
}

interface Tag {
	objectId: ObjectId;
	value: string;
}
```

Simple text blocks (full name, position, location) also get an id so the diff can track them:

```ts
interface TextBlock {
	objectId: ObjectId;
	value: string;
}
```

Entry types change `id: string` to `objectId: ObjectId` and switch from bare string arrays to the typed wrappers above:

```ts
interface ContactEntry {
	objectId: ObjectId;
	label: string;
	value: string;
}

interface JobEntry {
	objectId: ObjectId;
	company: string;
	role: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
	achievements: Achievement[];
	skills: Tag[];
}

interface ProjectEntry {
	objectId: ObjectId;
	name: string;
	description: string;
	stack: Tag[];
	link: string;
}

interface SkillCategory {
	objectId: ObjectId;
	name: string;
	skills: Tag[];
}

interface EducationEntry {
	objectId: ObjectId;
	institution: string;
	degree: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
}
```

`CVBlocks` keeps its named fields so components can access `cv.blocks.jobHistory` directly. Each array block also gets an `ObjectId` for its container -- the diff uses it for hidden-block filtering:

```ts
interface CVBlocks {
	fullName: TextBlock;
	position: TextBlock;
	location: TextBlock;

	contactsBlockId: ObjectId;
	contacts: ContactEntry[];

	highlightsBlockId: ObjectId;
	highlights: Highlight[];

	skillsBlockId: ObjectId;
	skills: SkillCategory[];

	jobHistoryBlockId: ObjectId;
	jobHistory: JobEntry[];

	projectsBlockId: ObjectId;
	projects: ProjectEntry[];

	educationBlockId: ObjectId;
	education: EducationEntry[];
}
```

`CVBlockKey` remains as `keyof CVBlocks`, though it now includes the `*BlockId` fields alongside the data fields.

### Block visibility

Visibility is not part of the block data. The CV carries a separate `hiddenBlockIds` array listing ObjectIds of hidden blocks. For text blocks, this is the `TextBlock.objectId`. For array blocks, it is the `*BlockId` field (e.g., `contactsBlockId`).

Toggling visibility changes this array, not the block content, so it never produces a false diff.

### Updated CV interface

```ts
interface CV {
	id: string;
	name: string;
	notes: string;
	createdAt: number;
	updatedAt: number;
	version: number;
	blocks: CVBlocks;
	hiddenBlockIds: ObjectId[];

	// Tailoring (only set on tailored CVs)
	sourceId?: string;
	syncDecisions?: SyncDecisions;
}
```

A CV is "tailored" when `sourceId` is set. `notes` is not tailoring-specific; any CV can have notes.

The old `blockVisibility` map and `createEmptyCV()` factory are removed. CV creation goes through templates (see below).

---

## DB vs UI model boundary

The DB model and the UI model are the same shape right now. The `CV` interface above is what Dexie stores and what components bind to.

Svelte 5's `$state` makes nested plain objects deeply reactive, so there is no need for a separate UI type with `SvelteMap` or `SvelteSet`. The block components keep using `$bindable()` props on plain arrays and objects exactly as they do today.

Two named mapper functions in `src/lib/services/cv/mappers.ts` mark the boundary:

```ts
function loadCV(dbCv: CV): CV {
	// Identity for now.
	// If the UI model needs SvelteSet for hiddenBlockIds or
	// other reactive structures later, convert here.
	return dbCv;
}

function snapshotCV(uiCv: CV): CV {
	return $state.snapshot(uiCv);
}
```

`snapshotCV` wraps `$state.snapshot()`, stripping Svelte proxies before persistence. The auto-save effect in `CVStore` calls it instead of `$state.snapshot` directly.

The mappers are trivial today. They exist so that if the UI model diverges from the DB model later -- say `hiddenBlockIds` becomes a `SvelteSet` for O(1) lookups, or dates switch to timestamps in the DB -- the conversion logic has a home and the rest of the codebase does not need to change.

---

## Templates

A template is a plain TypeScript object describing the default block layout for a new CV. One hardcoded template called "Classic" for now. No database collection needed.

### CVTemplate type

```ts
interface CVTemplateBlock {
	label: string;
	blockKey: string;
	kind: 'text' | 'array';
}

interface CVTemplate {
	name: string;
	blocks: CVTemplateBlock[];
}
```

### Classic template

```ts
const CLASSIC_TEMPLATE: CVTemplate = {
	name: 'Classic',
	blocks: [
		{ label: 'Full Name', blockKey: 'fullName', kind: 'text' },
		{ label: 'Position', blockKey: 'position', kind: 'text' },
		{ label: 'Location', blockKey: 'location', kind: 'text' },
		{ label: 'Contacts', blockKey: 'contacts', kind: 'array' },
		{ label: 'Highlights', blockKey: 'highlights', kind: 'array' },
		{ label: 'Skills', blockKey: 'skills', kind: 'array' },
		{ label: 'Job History', blockKey: 'jobHistory', kind: 'array' },
		{ label: 'Projects', blockKey: 'projects', kind: 'array' },
		{ label: 'Education', blockKey: 'education', kind: 'array' }
	]
};
```

### CV creation service

Replaces the old `createEmptyCV()`. Generates ObjectIds for every block and container:

```ts
function createCVFromTemplate(
	id: string,
	name: string,
	template: CVTemplate = CLASSIC_TEMPLATE
): CV {
	const now = Date.now();

	return {
		id,
		name,
		notes: '',
		createdAt: now,
		updatedAt: now,
		version: 1,
		blocks: {
			fullName: { objectId: createObjectId(), value: '' },
			position: { objectId: createObjectId(), value: '' },
			location: { objectId: createObjectId(), value: '' },
			contactsBlockId: createObjectId(),
			contacts: [],
			highlightsBlockId: createObjectId(),
			highlights: [],
			skillsBlockId: createObjectId(),
			skills: [],
			jobHistoryBlockId: createObjectId(),
			jobHistory: [],
			projectsBlockId: createObjectId(),
			projects: [],
			educationBlockId: createObjectId(),
			education: []
		},
		hiddenBlockIds: []
	};
}
```

These live in `src/lib/services/cv/`. The template and creation logic are not tailoring-specific; a standalone CV uses the same path.

---

## Dexie schema

The app is not published yet, so there is no migration to worry about. Just define the target schema directly. Any existing local dev data can be cleared by deleting the IndexedDB database in browser DevTools.

In `src/lib/db/index.ts`:

```ts
this.version(1).stores({
	cvs: 'id, updatedAt, sourceId'
});
```

The `sourceId` index lets us query "all tailored CVs for a given master" without scanning the whole table.

---

## Version counter

The CV carries a `version: number` field that starts at 1 and increments on every debounced auto-save. This replaces timestamp-based comparisons for sync detection.

In `CVStore`'s auto-save effect:

```ts
await db.cvs.put({
	...snapshotCV(this.cv),
	updatedAt: Date.now(),
	version: (this.cv.version ?? 0) + 1
});
```

`updatedAt` remains for display ("Last edited 3 min ago") but is not used for sync logic.

Why a counter instead of timestamps: timestamps are unreliable when two saves happen in quick succession or when clocks drift. A monotonic counter is unambiguous.

---

## Per-block diffing

No snapshots are stored. Diffing compares the master CV against the tailored CV at the moment the user opens the sync modal.

Each block type has its own diff function. The diff functions do not return results directly -- they report changes through an `IDiffBuilder` interface. The builder accumulates whatever representation the caller needs (view models for the sync modal, a plain text summary, etc.).

### IDiffBuilder

```ts
interface IDiffBuilder {
	textModified(blockKey: CVBlockKey, objectId: ObjectId, before: string, after: string): void;

	entryAdded(
		blockKey: CVBlockKey,
		entry: JobEntry | ProjectEntry | ContactEntry | SkillCategory | EducationEntry | Highlight
	): void;

	entryRemoved(
		blockKey: CVBlockKey,
		entry: JobEntry | ProjectEntry | ContactEntry | SkillCategory | EducationEntry | Highlight
	): void;

	entryModified(
		blockKey: CVBlockKey,
		objectId: ObjectId,
		before: Record<string, unknown>,
		after: Record<string, unknown>
	): void;
}
```

Type safety: every `IDiffBuilder` implementation must handle all methods. Adding a new change type means adding a method to the interface, and TypeScript flags every builder that does not implement it.

### Per-block diff functions

```ts
function diffTextBlock(
	key: CVBlockKey,
	master: TextBlock,
	tailored: TextBlock,
	builder: IDiffBuilder
): void;

function diffHighlights(master: Highlight[], tailored: Highlight[], builder: IDiffBuilder): void;

function diffContacts(
	master: ContactEntry[],
	tailored: ContactEntry[],
	builder: IDiffBuilder
): void;

function diffSkills(
	master: SkillCategory[],
	tailored: SkillCategory[],
	builder: IDiffBuilder
): void;

function diffJobHistory(master: JobEntry[], tailored: JobEntry[], builder: IDiffBuilder): void;

function diffProjects(
	master: ProjectEntry[],
	tailored: ProjectEntry[],
	builder: IDiffBuilder
): void;

function diffEducation(
	master: EducationEntry[],
	tailored: EducationEntry[],
	builder: IDiffBuilder
): void;
```

Each array diff function works the same way:

1. Build a map of tailored entries by `objectId`.
2. Walk the master array. For each entry:

- Not found in tailored map: call `builder.entryAdded(...)`.
- Found but fields differ: call `builder.entryModified(...)`.
- For composite entries (JobEntry, SkillCategory, ProjectEntry): also diff nested children (achievements, skills, stack) the same way -- match by `objectId`, report additions/removals/modifications.

3. Walk the tailored array. Entries not in the master are ignored -- the user added them after tailoring or the master removed them. Neither is a syncable change.

Text block diffing is simpler: compare values, call `builder.textModified(...)` if they differ.

### Convenience wrapper

```ts
function diffCVs(master: CV, tailored: CV, builder: IDiffBuilder): void {
	const hidden = new Set(master.hiddenBlockIds);

	// Text blocks
	if (!hidden.has(master.blocks.fullName.objectId))
		diffTextBlock('fullName', master.blocks.fullName, tailored.blocks.fullName, builder);
	if (!hidden.has(master.blocks.position.objectId))
		diffTextBlock('position', master.blocks.position, tailored.blocks.position, builder);
	if (!hidden.has(master.blocks.location.objectId))
		diffTextBlock('location', master.blocks.location, tailored.blocks.location, builder);

	// Array blocks
	if (!hidden.has(master.blocks.contactsBlockId))
		diffContacts(master.blocks.contacts, tailored.blocks.contacts, builder);
	if (!hidden.has(master.blocks.highlightsBlockId))
		diffHighlights(master.blocks.highlights, tailored.blocks.highlights, builder);
	if (!hidden.has(master.blocks.skillsBlockId))
		diffSkills(master.blocks.skills, tailored.blocks.skills, builder);
	if (!hidden.has(master.blocks.jobHistoryBlockId))
		diffJobHistory(master.blocks.jobHistory, tailored.blocks.jobHistory, builder);
	if (!hidden.has(master.blocks.projectsBlockId))
		diffProjects(master.blocks.projects, tailored.blocks.projects, builder);
	if (!hidden.has(master.blocks.educationBlockId))
		diffEducation(master.blocks.education, tailored.blocks.education, builder);
}
```

### Concrete example

Master CV has a job entry for Stripe. The user tailored the CV, then later the master gets these edits: the company name changes from "Stripe" to "Stripe, Inc." and one achievement is added.

`diffJobHistory(master.blocks.jobHistory, tailored.blocks.jobHistory, builder)` does the following:

1. The Stripe entry exists in both arrays (same `objectId`). Fields differ (`company: 'Stripe'` vs `company: 'Stripe, Inc.'`), so the function calls `builder.entryModified('jobHistory', stripeEntryId, { company: 'Stripe', ... }, { company: 'Stripe, Inc.', ... })`.
2. Inside the entry, the function diffs the `achievements` arrays. The new achievement's `objectId` is missing from the tailored list, so it calls `builder.entryAdded('jobHistory', newAchievement)`.

Each change has its own `ObjectId`. The user can accept or discard each independently.

### Location

`src/lib/features/tailoring/diff.ts`. Pure functions, no side effects.

---

## Sync decisions

Sync with master tracks individual decisions. If the user accepts some changes but leaves others untouched, the untouched ones stay visible as pending. The badge stays until every diff item has been either accepted or explicitly discarded.

### SyncDecisions type

Stored on the tailored CV:

```ts
interface SyncDecisions {
	sourceSyncedVersion: number;
	discarded: Record<ObjectId, number>;
}
```

`sourceSyncedVersion` is the master's `version` at which all diff items were last fully resolved (every item either accepted or discarded). Initialized to `master.version` at tailoring time, because a fresh copy has nothing to sync.

`discarded` maps an ObjectId of a discarded change to the master version at which the user discarded it.

### Discard lifecycle

When the user discards a change: `discarded[objectId] = master.version`.

On the next sync review, if `master.version > discarded[objectId]`, the master changed that data again since the discard. The old decision is stale, the item becomes a fresh pending change. Stale entries get pruned during sync review.

If the master has not changed since the discard, the item stays marked as discarded. It still appears in the sync modal (so the user can see what they dismissed) but does not count as pending.

---

## "Updates available" detection

The dashboard needs a badge on tailored CVs without running a full diff on every render. The check is cheap:

```ts
function hasUpdatesAvailable(master: CV, tailored: CV): boolean {
	const synced = tailored.syncDecisions?.sourceSyncedVersion ?? 0;
	return master.version > synced;
}
```

If `master.version > sourceSyncedVersion`, there are unresolved changes and the badge shows. The only way to clear it is to resolve every diff item.

False positives are possible: the master might have changed a hidden block or data the tailored CV does not use. The sync modal shows "no relevant changes" in those cases, and resolving the empty list sets `sourceSyncedVersion = master.version`, clearing the badge.

False negatives cannot happen: any master edit increments `version`.

### Where it runs

The dashboard already loads all CVs on mount. For each tailored CV, it looks up the master by `sourceId` in the same array. No extra DB queries.

---

## Sync flow

### Opening the sync modal

The user clicks "Sync" on a tailored CV (dashboard badge or editor toolbar). The app:

1. Loads the master CV by `sourceId`.
2. Runs `diffCVs(master, tailored, builder)`.
3. Opens the sync modal with the builder's results.

If the master CV no longer exists (deleted between badge appearing and user clicking), show a message: "The source CV was deleted. This CV is now standalone." Clear `sourceId` and `syncDecisions`, then close.

### Inside the modal

The modal works on local component state. Nothing is written to the CV store until the modal closes.

Each diff item has three possible actions:

- **Accept**: apply this change from the master.
- **Discard**: explicitly decline this change.
- **Revert**: undo a previous accept or discard, returning the item to pending.

The modal tracks decisions in a local map: `Map<ObjectId, 'accepted' | 'discarded'>`. Items not in the map are pending. The user can freely toggle between states while the modal is open.

For `modified` items, show old and new values side by side. For `added` items, show the new entry with a preview. Previously discarded items (from a prior sync review at the same master version) appear with a "previously discarded" indicator.

Buttons: "Apply and close" and "Close" (without applying). Both commit the current state.

### On close (commit)

`applySyncDecisions(tailoredCv, masterCv, decisions)` in `src/lib/features/tailoring/apply.ts` handles this. It mutates the tailored CV's nested structure directly:

- `textModified` accepted: overwrite `TextBlock.value` with the master's value.
- `entryAdded` accepted: deep-copy the entry from the master and append it to the corresponding array.
- `entryRemoved` accepted: filter the entry out of the array by `objectId`.
- `entryModified` accepted: find the entry by `objectId` in the array and overwrite its fields with the master's version.

Write the `discarded` map to `syncDecisions.discarded` with the current `master.version` for each discarded item. Remove entries for accepted items from the map (if they were previously discarded).

Prune stale discards: remove any entries where the stored version is less than `master.version`.

Compute `sourceSyncedVersion`: if every diff item has a decision (accepted or discarded), set `sourceSyncedVersion = master.version`. If any items are still pending (no decision), leave `sourceSyncedVersion` unchanged.

Persist everything in one write to the CV store. The auto-save effect picks up the change.

### State management

The sync modal does not need its own store. It receives the master and tailored CVs as props, runs the diff internally, tracks local state for decisions, and calls a callback with the resolved state on close. The editor's `CVStore` handles the actual mutations.

---

## Tailored CV creation flow

### Trigger points

1. "Tailor" button on `CvCard` (dashboard).
2. "Tailor" button in `CvEditorToolbar` (editor).

Both open the same modal.

### Modal contents

- **Name** field (required). Placeholder: "e.g. Stripe -- Senior Frontend".
- **Notes** field (optional, textarea). Placeholder: "e.g. Tailored for their ML team".
- "Create" button.

### On confirm

```ts
async function createTailoredCV(master: CV, name: string, notes: string): Promise<string> {
	const id = crypto.randomUUID();
	const now = Date.now();

	const tailored: CV = {
		id,
		name,
		notes,
		createdAt: now,
		updatedAt: now,
		version: 1,
		blocks: structuredClone(master.blocks),
		hiddenBlockIds: [...master.hiddenBlockIds],
		sourceId: master.id,
		syncDecisions: {
			sourceSyncedVersion: master.version,
			discarded: {}
		}
	};

	await db.cvs.add(tailored);
	return id;
}
```

`sourceSyncedVersion` starts at `master.version` because a fresh copy is fully in sync. The badge will not show until the master is edited.

After creation, navigate to `/cv/[id]` so the user lands in the editor.

---

## Master CV deletion

When the user deletes a CV, check if any other CVs have `sourceId` pointing to it:

```ts
const dependents = await db.cvs.where('sourceId').equals(cvId).toArray();
```

If `dependents.length > 0`, show a dialog:

> "This CV has {n} tailored copies. What would you like to do?"
>
> - **Delete them too** -- deletes the master and all tailored copies.
> - **Keep them as standalone** -- clears `sourceId` and `syncDecisions` on each copy, then deletes the master.
> - **Cancel** -- do nothing.

---

## Dashboard modifications

### CvCard changes

- If the CV has `sourceId`, show a small label: "From: {master name}" (look up master by id).
- If `hasUpdatesAvailable()` returns true, show a dot/badge next to the label.
- Add a "Tailor" action button (alongside existing View and Delete).

### Filtering

Add a filter bar above the CV list with three options: All, Source CVs, Tailored CVs. "Source CVs" means `sourceId` is undefined; "Tailored CVs" means it is defined. Default is All.

Filtering is done client-side on the already-loaded array. No extra DB queries.

---

## Editor toolbar changes

When editing a tailored CV:

- Show a "Tailored from: {master name}" label (clicking it navigates to the master).
- Show a "Sync" button. If updates are available, the button gets a dot indicator.
- The "Tailor" button appears only on CVs where `sourceId` is undefined (multi-level tailoring is a non-goal per the PRD).

When editing any CV:

- The `notes` field is editable in the toolbar or in a popover below the CV name.

---

## Component tree (new and modified)

```
lib/components/
  blocks/
    text-block.svelte             <- NEW (replaces full-name, position, location blocks)
    bullet-list-block.svelte      <- renamed from highlights-block
    contacts-block.svelte         <- MODIFIED: uses ObjectId for drag keys
    skills-block.svelte           <- MODIFIED: Tag[] instead of string[]
    job-history-block.svelte      <- MODIFIED: Achievement[], Tag[] instead of string[]
    projects-block.svelte         <- MODIFIED: Tag[] instead of string[]
    education-block.svelte        <- MODIFIED: uses ObjectId for drag keys

  dashboard/
    cv-card.svelte                <- MODIFIED: add "Tailor" action, lineage label, badge
    cv-list.svelte                <- MODIFIED: add filter bar
    tailor-modal.svelte           <- NEW: name + notes form for creating a tailored CV

  editor/
    cv-preview.svelte             <- MODIFIED: renders blocks from cv.blocks directly
    cv-editor-toolbar.svelte      <- MODIFIED: add sync button, lineage label, notes
    sync-modal.svelte             <- NEW: runs diff, provides IDiffBuilder, accept/discard/revert

  ui/
    diff-item-row.svelte          <- NEW: single diff item with action buttons, old/new values
```

The three old text-specific components (`full-name-block`, `position-block`, `location-block`) collapse into one `text-block.svelte` since they all render a single `InlineField`.

### sync-modal.svelte

Props:

- `masterCv: CV`
- `tailoredCv: CV`
- `onClose: (result: SyncResult) => void`

Runs `diffCVs` with an `IDiffBuilder` implementation that builds view models for rendering. Manages local decision state. Returns the final decisions on close.

### tailor-modal.svelte

Props:

- `sourceCv: CV`
- `onCreate: (id: string) => void`

Handles the creation flow described above.

### diff-item-row.svelte

Props:

- `item: DiffViewItem` (view model produced by the builder)
- `decision: 'accepted' | 'discarded' | undefined`
- `onAccept: () => void`
- `onDiscard: () => void`
- `onRevert: () => void`

Renders a single change: block label, entry description, old vs new values, and action buttons.

---

## File layout

```
src/lib/
  types/
    cv.ts                          <- MODIFIED: ObjectId, TextBlock, Achievement,
                                      Highlight, Tag, updated entry types with ObjectId,
                                      CVBlocks (nested with block ids), CV interface.
                                      Remove blockVisibility, createEmptyCV.
  db/
    index.ts                       <- MODIFIED: add sourceId index, no migration
  stores/
    cv.svelte.ts                   <- MODIFIED: version increment in auto-save,
                                      uses snapshotCV() from mappers
  services/
    cv/
      create.ts                    <- NEW: createCVFromTemplate(), createObjectId()
      templates.ts                 <- NEW: CVTemplate type, CLASSIC_TEMPLATE
      mappers.ts                   <- NEW: loadCV(), snapshotCV()
  features/
    tailoring/
      types.ts                     <- NEW: IDiffBuilder interface, SyncDecisions
      diff.ts                      <- NEW: per-block diff functions, diffCVs() wrapper
      apply.ts                     <- NEW: applySyncDecisions()
      detection.ts                 <- NEW: hasUpdatesAvailable()
      create-tailored.ts           <- NEW: createTailoredCV()
  components/
    blocks/
      text-block.svelte            <- NEW
      bullet-list-block.svelte     <- renamed
      [rest modified for ObjectId-based data access]
    dashboard/
      cv-card.svelte               <- MODIFIED
      cv-list.svelte               <- MODIFIED
      tailor-modal.svelte          <- NEW
    editor/
      cv-preview.svelte            <- MODIFIED: renders from cv.blocks
      cv-editor-toolbar.svelte     <- MODIFIED
      sync-modal.svelte            <- NEW (provides IDiffBuilder for rendering)
    ui/
      diff-item-row.svelte         <- NEW
```

---

## Edge cases

**Master deleted while sync modal is open.** The modal works on already-loaded data, so it won't crash mid-session. The write targets the tailored CV, not the master, so it still succeeds. On next load, `sourceId` points to a missing CV. Handle this by clearing `sourceId` and `syncDecisions`, then showing a toast.

**Multiple tailored CVs from the same master.** Each tailored CV is independent. They share `sourceId` but have their own `syncDecisions`. No conflict.

**Master hides a block after tailoring.** If the block's ObjectId is in `master.hiddenBlockIds`, `diffCVs` skips it. If the user later un-hides it, diffs resume.

**Tailored CV removes an entry, master modifies it.** The entry's ObjectId is missing from the tailored CV's array, so the diff function skips it. The user chose to drop it.

**All items discarded, master changes the same fields.** The discard decisions are keyed to the master version at the time of discard. When the master version exceeds the stored version, those discards become stale and the items reappear as fresh pending changes. The badge comes back.

**Empty diff after badge.** The badge uses a coarse version check. The master might have changed a hidden block or data the tailored CV does not use. The sync modal shows "no relevant changes." Closing the modal with an empty diff list sets `sourceSyncedVersion = master.version` (all zero items are resolved), clearing the badge.

---

## Testing

### Unit tests

- `diff.ts`: test each per-block diff function independently. For array blocks: test added, removed, and modified entries. For text blocks: test value changes. Test that `diffCVs` skips hidden blocks. Test that entries only in the tailored CV are ignored.
- `apply.ts`: test that accepting a text change updates the correct `TextBlock.value`. Test that accepting an added entry appends it to the right array. Test that discarded items are recorded with the correct version and stale discards are pruned.
- `detection.ts`: test `hasUpdatesAvailable` with various version combinations. Badge shows when master version exceeds synced version, clears when they match.
- `create-tailored.ts`: test that the created CV has a deep copy of blocks (not a reference), that `syncDecisions.sourceSyncedVersion` matches the master's version, and that modifying the copy does not affect the master.
- `services/cv/create.ts`: test that `createCVFromTemplate` produces a valid CV with correct block structure, all ObjectIds present and unique, and `hiddenBlockIds` empty.

### Manual verification

1. Create a CV with several blocks filled out.
2. Tailor it. Verify the copy has all content and `sourceId` is set.
3. Edit the master. Verify the dashboard shows the badge.
4. Open the sync modal. Verify changes appear correctly.
5. Accept some changes, discard one, leave one untouched. Close the modal.
6. Verify accepted changes are applied, the discarded item is recorded, and the badge persists (because of the untouched item).
7. Open the sync modal again. Verify the untouched item is still pending, the discarded item shows as "previously discarded."
8. Resolve all remaining items. Verify the badge disappears.
9. Edit the master on a field that was previously discarded. Verify the badge reappears and the item is pending again (discard reset).
10. Delete the master. Verify the prompt appears and both options work.
