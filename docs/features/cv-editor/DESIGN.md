# DESIGN: CV Editor

## Tech stack

- **Framework**: Svelte 5 + SvelteKit 2 (static adapter, no SSR)
- **Styling**: TailwindCSS 4 + Shadcn-Svelte
- **Local storage**: IndexedDB via Dexie.js (see ADR-001)
- **Language**: TypeScript 5 (strict mode)

---

## Routes

```
/                  → CV Dashboard (list of all CVs)
/cv/[id]           → CV Editor for a specific CV
```

Both are SvelteKit page routes. Since the app uses the static adapter, all navigation is client-side.

---

## Data model

All types are defined in `src/lib/types/cv.ts`.

```ts
// A single CV document stored in IndexedDB
interface CV {
	id: string; // uuid, primary key
	name: string; // user-given name (e.g. "Master CV")
	createdAt: number; // unix ms timestamp
	updatedAt: number; // unix ms timestamp — updated on every auto-save
	blocks: CVBlocks; // the structured content
	blockVisibility: Record<CVBlockKey, boolean>; // true = visible
}

// All block content, keyed by block type
interface CVBlocks {
	fullName: string;
	position: string;
	location: string;
	contacts: ContactEntry[];
	highlights: string[];
	jobHistory: JobEntry[];
	projects: ProjectEntry[];
	education: EducationEntry[];
}

type CVBlockKey = keyof CVBlocks;

interface ContactEntry {
	id: string;
	label: string; // e.g. "GitHub"
	value: string; // e.g. "github.com/me"
}

interface JobEntry {
	id: string;
	company: string;
	role: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
	achievements: string[];
}

interface ProjectEntry {
	id: string;
	name: string;
	description: string;
	stack: string; // comma-separated or free text
	link: string;
}

interface EducationEntry {
	id: string;
	institution: string;
	degree: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
}
```

---

## IndexedDB schema (Dexie)

Defined in `src/lib/db/index.ts`:

```ts
import Dexie, { type Table } from 'dexie';

class HumbleHireDB extends Dexie {
	cvs!: Table<CV>;

	constructor() {
		super('humblehire');
		this.version(1).stores({
			cvs: 'id, updatedAt'
		});
	}
}

export const db = new HumbleHireDB();
```

---

## State management

State lives in Svelte 5 runes; no external state library.

### `src/lib/stores/cv.svelte.ts` — CVStore class

`CVStore` is a class shared through Svelte context:

```ts
export class CVStore {
	cv = $state<CV | null>(null);
	saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	lastSavedAt = $state<number | null>(null);

	constructor() {
		$effect(() => {
			// auto-save with 1s debounce
		});
	}
}

export function setCVStoreContext(store: CVStore): void { ... }
export function getCVStoreContext(): CVStore { ... }
```

The editor page creates the store and sets context. Children call `getCVStoreContext()` to read/write. Auto-save is an `$effect` in the constructor that snapshots the full CV (for deep reactive tracking) and debounces writes to IndexedDB by 1 second.

---

## Component tree

```
routes/
  +page.svelte              ← CV Dashboard
  cv/
    [id]/
      +page.svelte          ← CV Editor page (loads CV from DB, renders editor)

lib/components/
  dashboard/
    CvList.svelte           ← list of CV cards
    CvCard.svelte           ← single CV card (name, date, actions)
    NewCvButton.svelte      ← creates new CV and navigates to editor

  editor/
    CvEditorToolbar.svelte  ← top bar: CV name, save status
    CvPreview.svelte        ← rendered CV; manages inline edit activation

  blocks/
    FullNameBlock.svelte
    PositionBlock.svelte
    LocationBlock.svelte
    ContactsBlock.svelte    ← list of ContactEntry rows + add/remove
    HighlightsBlock.svelte  ← ordered bullet list + add/remove
    JobHistoryBlock.svelte  ← list of JobEntry cards + add/remove
    ProjectsBlock.svelte    ← list of ProjectEntry cards + add/remove
    EducationBlock.svelte   ← list of EducationEntry cards + add/remove

  ui/
    BlockWrapper.svelte     ← common shell: section heading + visibility toggle
    InlineField.svelte      ← click-to-edit text field (renders as text; becomes input on click)
    InlineTextarea.svelte   ← same as above for multiline content
```

---

## Inline editing pattern

`InlineField.svelte` renders as plain text and swaps to a native `<input>` on click:

```svelte
<script lang="ts">
  let { value = $bindable(), placeholder = '' }: { value: string; placeholder?: string } = $props();
  let editing = $state(false);
</script>

{#if editing}
  <input
    bind:value
    {placeholder}
    onblur={() => (editing = false)}
    onkeydown={(e) => e.key === 'Escape' && (editing = false)}
    autofocus
  />
{:else}
  <span
    role="button"
    tabindex="0"
    onclick={() => (editing = true)}
    onkeydown={(e) => e.key === 'Enter' && (editing = true)}
  >
    {value || placeholder}
  </span>
{/if}
```

`InlineTextarea.svelte` follows the same pattern but uses `<textarea>` with auto-height.

---

## Block visibility

`BlockWrapper.svelte` receives `visible: boolean` and an `ontoggle` callback. When `visible` is false, the block body is not rendered (not just hidden via CSS), so invisible blocks never appear in the preview or in print output.

---

## CV dashboard

`routes/+page.svelte` loads all CVs on mount via `db.cvs.orderBy('updatedAt').reverse().toArray()`. Creating a new CV:

1. Generate a `uuid` for the new CV.
2. Write a skeleton `CV` object to `db.cvs`.
3. Navigate to `/cv/[id]`.

Delete shows a confirmation dialog (Shadcn `AlertDialog`) before calling `db.cvs.delete(id)`.

---

## File layout

```
src/
  lib/
    types/
      cv.ts              ← all shared TS interfaces
    db/
      index.ts           ← Dexie DB singleton
    stores/
      cv.svelte.ts       ← reactive CV state + auto-save effect
    components/
      dashboard/...
      editor/...
      blocks/...
      ui/...
  routes/
    +page.svelte
    cv/[id]/+page.svelte
```

---

## Shadcn-Svelte components

Plain HTML handles inline inputs and block text. Everything below needs a shadcn component.

| Component    | Used in                                                                 | Notes                                       |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------------- |
| Button       | `NewCvButton`, toolbar actions, add/remove rows in list blocks          | Buttons                                     |
| Card         | `CvCard` on the dashboard; job, project, and education entry containers | Wraps each entry with consistent spacing    |
| Alert Dialog | Delete CV confirmation                                                  | Blocks the user before a destructive action |
| Input        | `InlineField` (edit mode)                                               | Single-line text                            |
| Textarea     | `InlineTextarea` (edit mode)                                            | Multiline text                              |
| Switch       | Block visibility toggle in `BlockWrapper`                               | On/off maps to show/hide                    |
| Badge        | Save status (`idle` / `saving` / `saved`) in `CvEditorToolbar`          | Compact status indicator                    |
| Skeleton     | Dashboard while CVs load from IndexedDB                                 | Loading placeholder for CV cards            |
| Separator    | Between CV sections in `CvPreview`                                      | Visual section divider                      |
| Sonner       | Auto-save error notifications                                           | Toasts that don't interrupt editing         |

---

## Key design decisions

| Decision                 | Choice                                    | Rationale                                                            |
| ------------------------ | ----------------------------------------- | -------------------------------------------------------------------- |
| Local storage engine     | IndexedDB via Dexie.js                    | See ADR-001                                                          |
| State management         | Svelte 5 runes (`$state`, `$effect`)      | No extra library needed; runes are fine-grained and reactive         |
| Inline editing primitive | Click-to-edit `<input>`/`<textarea>` swap | Matches the "preview is the editor" UX; simpler than contenteditable |
| No version snapshots     | Deferred to Branching feature             | Snapshots only meaningful in branching context; autosave covers v1   |
| Block order              | Fixed                                     | Reduces scope and complexity for v1; blocks are semantically ordered |
| UUID generation          | `crypto.randomUUID()`                     | Built into modern browsers; no library needed                        |
