# HumbleHire

The shared vocabulary for HumbleHire, a local-first CV builder organised around master / tailored relationships and selective sync. Use these terms in code, docs, issue titles, and commit messages. When two words exist for the same idea, the one listed under `Avoid` should not appear in product-facing text.

## Language

### Core

**CV**:
A single resume document. Holds a name, an optional company label, and a set of blocks. Every document in HumbleHire is a CV; "master" and "tailored" are roles, not separate types.
_Avoid_: Resume, document, profile

**Block**:
One of the nine fixed sections of a CV (Full Name, Position, Location, Contacts, Highlights, Skills, Job History, Projects, Education). Block order is fixed and users cannot reorder.
_Avoid_: Section, field (when referring to a whole block)

**Entry**:
A single repeatable item inside a block. One job inside Job History, one project inside Projects, one contact line.
_Avoid_: Item, record, row

**Nested entry**:
An item inside an entry. One achievement inside a job, one skill tag inside a project's stack.
_Avoid_: Sub-entry, child item

**Hidden block**:
A block whose content is preserved but excluded from the export. Hidden state is per CV, stored as a list of block IDs.
_Avoid_: Disabled block, off block

### Tailoring

**Master CV**:
A CV that was not derived from any other. The user's comprehensive career record. "Master" is a role determined by the absence of a link back; it is not a separate document type.
_Avoid_: Source, parent, original, base CV. The code field `sourceId` references this concept; in product language only "master" is used.

**Tailored CV**:
A CV created by copying from a master at a specific moment, retaining a link back to that master. Independent after creation: edits on either side do not propagate automatically.
_Avoid_: Copy, clone, variant, fork

**Tailoring**:
The act of creating a tailored CV from a master.
_Avoid_: Forking, branching, cloning

**Sync**:
The action of pulling changes from a master into one of its tailored copies. Always one-way (master into tailored) and always selective (each change is decided individually).
_Avoid_: Merge, pull, update, refresh

### Sync mechanism

**Sync baseline**:
The snapshot of the master's blocks captured the moment a tailored CV was created or last fully synced. Sync diffs are computed against this baseline, not against the master's full edit history.
_Avoid_: Snapshot, checkpoint, fork point

**Sync decisions**:
The per-tailored-CV record of which incoming changes have been accepted or discarded, and at which master version that decision was made. Discarded decisions are remembered so the same change does not re-prompt until the master changes again.
_Avoid_: Sync state, sync log

**Diff item**:
A single unit of change shown in the sync view. One of three kinds: a text edit on a single-text block, an entry change (added, removed, or modified at the top level), or a nested change (added, removed, or modified inside an entry). Each diff item is accepted or discarded independently.
_Avoid_: Change, delta, hunk

**Master version**:
An integer counter on the master CV that increments when it is edited. Used by the sync detector to decide whether a tailored copy has unseen master changes. Internal only; not a snapshot store and not exposed to users as a version history.
_Avoid_: Version (bare). Users may read "version" as Git-style snapshot versioning, which HumbleHire does not support.

**Updates available**:
The indicator on a tailored CV showing that its master has changed in a way that has not been reviewed yet.
_Avoid_: Outdated, stale, behind

### Surfaces

**Dashboard**:
The CV list view, grouped by master with tailored copies nested underneath. Hosts fuzzy search and the master / tailored group filter.
_Avoid_: Home, library, list page

**Preview**:
The right-side pane in the editor that renders the live PDF of the current CV, page-for-page identical to what would be exported.
_Avoid_: Render, output, view

**Theme**:
A self-contained PDF rendering module that takes filtered CV blocks and produces a PDF layout. The v1 theme is "Classic." Adding a theme means adding a module, not editing the editor or the data model.
_Avoid_: Template, style, layout

## Flagged ambiguities

**"Version"** is the easiest term to misuse in this codebase.

- _Acceptable_: "master version counter," the internal integer used by sync detection.
- _Not acceptable_: "CV version," "version history," "save a version." These imply a Git-style snapshot store that does not exist. Use "tailored CV" for a derived copy or "sync baseline" for the captured-at-tailoring snapshot.

**"Block"** sometimes appears in code to mean the `Block<T>` wrapper object (a `{ objectId, value }` pair). That is an implementation detail. In product language, "block" always means one of the nine CV sections.

**"Master"** is a role, not a flag. A CV is a master whenever it has no `sourceId`. The same CV can have many tailored copies pointing to it; there is no inverse list on the master side.

## Example dialogue

> **Dev**: When the user clicks Sync on a tailored CV, what exactly do they see?
>
> **PM**: A list of diff items. Each one is a single change the master made since the last time this tailored CV synced. Could be a text edit on Position, a new job entry in Job History, or just one new achievement inside an existing job. Each item has Accept and Discard buttons.
>
> **Dev**: And if they discard one, does it come back next time?
>
> **PM**: Not until the master changes again. We remember the discard against the current master version. Once the master moves forward, the diff is recomputed and that item may or may not reappear, depending on whether it is still a real difference.
>
> **Dev**: What about pushing a tailored edit back into the master?
>
> **PM**: Not a thing. Sync is master into tailored, full stop. A good edit on a tailored copy has to be re-entered into the master by hand.
>
> **Dev**: And tailored copies of tailored copies?
>
> **PM**: Also not a thing. Tailored CVs always derive from a master.
