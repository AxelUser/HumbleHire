# PRD: CV Editor

## Overview

The CV Editor is the core feature of HumbleHire. Users create and manage multiple CVs through an inline block editor: click any field to edit it, see changes immediately, and have edits auto-saved. Named version checkpoints are also supported. All data lives in IndexedDB.

---

## Goals

- Let users create, name, and switch between multiple CVs from a dashboard.
- Provide a click-to-edit inline experience where the preview *is* the editor.
- Persist all changes automatically; let users also create named version checkpoints.
- Support toggling block visibility without losing content.

## Non-goals

- Version branching, diffing, and merging (separate feature).
- Export to PDF/HTML (separate feature).
- Cloud sync or multi-device support.
- Custom block types beyond the fixed set.
- Block reordering (order is fixed per block type).

---

## User stories

### CV dashboard

- As a user, I can see a list of all my CVs on the home page, each showing its name and last-edited date.
- As a user, I can create a new empty CV from the dashboard.
- As a user, I can rename or delete an existing CV from the dashboard.
- As a user, I can open a CV to start editing it.

### Inline block editor

- As a user, I can click on any field in the CV preview to edit it in place.
- As a user, I can see edits reflected in the preview immediately as I type.
- As a user, I can toggle a block's visibility (show/hide) without deleting its content.
- As a user, I can add multiple entries to repeatable blocks (Job History, Projects, Education).
- As a user, I can delete an individual entry from a repeatable block.

### Contacts block

- As a user, I can add contact entries as free-form label + value pairs (e.g. "GitHub → github.com/me").
- As a user, I can remove any contact entry.

### Persistence

- As a user, my edits are automatically saved to local storage a short time after I stop typing — I never have to think about saving.
- As a user, I can explicitly save a named version checkpoint ("Save Version") with an optional description, so I can return to meaningful milestones later.
- As a user, I can see when the CV was last auto-saved.

---

## CV blocks (fixed set, fixed order)

| # | Block       | Repeatable | Notes                                        |
|---|-------------|------------|----------------------------------------------|
| 1 | Full Name   | No         | Single text field                            |
| 2 | Position    | No         | Single text field (target job title)         |
| 3 | Location    | No         | Single text field                            |
| 4 | Contacts    | Yes        | List of label + value pairs                  |
| 5 | Highlights  | Yes        | Ordered list of bullet-point strings         |
| 6 | Job History | Yes        | Company, dates, role, achievements list      |
| 7 | Projects    | Yes        | Name, description, tech stack, optional link |
| 8 | Education   | Yes        | Institution, degree, dates                   |

Block order is fixed. Users cannot reorder blocks.

---

## UX behaviour

### Inline editing

- The rendered CV is always visible. Hovering a field highlights it with an edit affordance (cursor change + subtle outline).
- Clicking a field activates an inline input/textarea at that exact location; the rest of the preview remains static.
- Pressing `Escape` or clicking outside the active field deactivates edit mode and triggers auto-save.
- Pressing `Tab` moves focus to the next editable field.

### Block visibility toggle

- Each block section header has a show/hide toggle (eye icon).
- Hidden blocks show a collapsed placeholder in the editor so users know content exists; they are excluded from the rendered preview.

### Auto-save

- Changes are debounced with a 1-second delay.
- A subtle status indicator shows: `Saving…` → `Saved just now` → `Saved X minutes ago`.

### Save Version

- A "Save Version" button is always visible in the editor toolbar.
- Clicking it opens a modal asking for a version name (required, e.g. "Applied to Stripe") and optional notes.
- Saved versions are listed in a "Version History" panel (collapsed by default).

---

## Acceptance criteria

| ID   | Criterion                                                                                      |
|------|-----------------------------------------------------------------------------------------------|
| AC-1 | Dashboard lists all CVs with name and last-edited timestamp; empty state shown when none exist. |
| AC-2 | New CV can be created from dashboard; opens immediately in editor with all blocks empty.        |
| AC-3 | CV can be renamed and deleted from dashboard (with confirmation for delete).                    |
| AC-4 | Clicking any editable field activates an inline input at that location.                         |
| AC-5 | Changes appear in preview in real time as the user types.                                       |
| AC-6 | Changes are persisted to IndexedDB within 1 second of the user stopping input.                  |
| AC-7 | Each block can be toggled hidden/visible; hidden blocks are not rendered in preview.            |
| AC-8 | Repeatable blocks support adding and deleting individual entries.                               |
| AC-9 | Contacts block stores free-form label + value pairs.                                            |
| AC-10| "Save Version" creates a named snapshot with timestamp; listed in Version History panel.        |
| AC-11| All data survives a full browser/page refresh (persisted in IndexedDB).                         |
