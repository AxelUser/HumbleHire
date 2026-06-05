# HumbleHire

The shared vocabulary for HumbleHire, a local-first CV builder organised around master / tailored relationships and selective sync. Use these terms in code, docs, issue titles, and commit messages. When two words exist for the same idea, the one listed under `Avoid` should not appear in product-facing text.

This file is a glossary. It defines what each term means, not how any of it is built. Implementation lives in the code and in `docs/decisions/`.

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

**Hidden**:
Content that is preserved but excluded from the [[preview]] and [[export]]. Tracked per CV as a set of addresses — a section path (`work`, `basics.location`) today, an [[entry]] id when entry-level hiding ships. Used both while drafting a [[master cv]] (park a section) and while shaping a [[tailored cv]] (drop a section from one copy); it is not exclusively a tailoring concern.
_Avoid_: Disabled, off, "hidden block" (the unit is no longer a block).

**Snapshot**:
An immutable copy of a CV's block values at one moment, held as a value to hash, to save, or to compare against. A snapshot is a value, never a stored history of past states. Use "snapshot" for a particular captured state of a CV; "version" is not a HumbleHire word.
_Avoid_: Version, checkpoint, revision

**Local-first**:
Every CV lives only in the user's own browser storage and its content is never sent to a server. "Local-first" describes where CV _content_ lives; it is not a promise of zero network activity. The app legitimately makes non-content requests (the app shell, web fonts, anonymous cookieless usage metrics). Product copy must not claim "zero telemetry," "0 bytes sent," or "no network requests" — those are false. The honest, durable guarantee is that **CV content never leaves the device**.
_Avoid_: "Zero telemetry", "no network", "offline-only" used as synonyms for local-first.

### Model representations

The same CV exists in four shapes. Naming them keeps conversations about "the model" unambiguous about which one is meant.

**Stored CV**:
The shape of a CV as persisted in the browser database. Owns identity and whatever the [[runtime cv]] must survive a reload. Currently identical to the runtime shape; may diverge later to drop recomputed fields or to lay data out for storage consistency.
_Avoid_: DB model (when product-facing), persisted blob.

**Runtime CV**:
The shape of a CV held in memory and edited in the editor. The working representation; the [[stored cv]], the [[sync tree]], and the [[document]] are all reached from it.
_Avoid_: In-memory model, live CV.

**Sync tree**:
A generic node tree a [[runtime cv]] is projected into so the [[sync]] engine can diff and apply changes uniformly. Nodes carry a path, a kind, and a label. The runtime CV never imports the tree; the projection points one way only.
_Avoid_: Diff model, AST.

**Document**:
The structured JSON shape a CV is exported to and imported from — a DTO, never the [[runtime cv]]. Carries no machine ids, speaks [[json resume]] vocabulary, and is the only shape that crosses the app boundary. See [[serialization]].
_Avoid_: Export model, wire model (when a precise term is wanted), JSON (unqualified).

**Descriptor**:
The static schema that defines the [[sync tree]]: one tree of `NodeDescriptor`s mirroring the CV content shape, each carrying its kind (object, list, scalar) and its display labels, and **no values**. The single source of every label and breadcrumb in the [[sync]] view and the future i18n seam. Values come from the [[runtime cv]] during projection; the descriptor never holds data.
_Avoid_: Schema (unqualified — collides with [[db schema]] / [[json schema]]), metadata, model.

### Tailoring

**Master CV**:
A CV that was not derived from any other. The user's comprehensive career record. "Master" is a role determined by the absence of a link back to another CV; it is not a separate document type.
_Avoid_: Source, parent, original, base CV.

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
The agreed reference state of a [[tailored cv]]: the [[snapshot]] of the master's content the tailored copy is measured against to detect what the master changed. Detection is three-sided, comparing the baseline, the master's current content, and the tailored copy's own edits. The baseline advances **per resolved [[diff item]]** (accept or discard both move it to the master at that [[path]]), so it always marks what has already been reconciled, not a fixed creation point. A [[hidden]] section produces no diff items, so its baseline does not advance — its master changes surface honestly the moment it is unhidden, for the user to decide.
_Avoid_: Snapshot (too general; the baseline is one specific snapshot), checkpoint, fork point

**Sync decisions**:
The record, kept per tailored CV, of which incoming changes have been accepted or discarded, and against which state of the master that decision was made. A discarded change is remembered so it does not re-prompt until the master changes again.
_Avoid_: Sync state, sync log

**Diff item**:
A single unit of change shown in the [[sync]] view, addressed by a [[path]] into the CV content. Two kinds: an [[entry]] added or removed (the path ends at a list entry id), or one scalar field modified (the path ends at that field, carrying before/after). Field changes are per-field — a job with three changed fields yields three diff items, each accepted or discarded independently.
_Avoid_: Change, delta, hunk

**Path**:
The address of a node in the CV content, used by [[diff item]]s to locate what changed. A sequence of segments that alternates by context: a field name when descending into an object, an [[entry]]'s `objectId` when descending into a list. List descent is always by id, never by position, so diffs stay order-agnostic.
_Avoid_: Pointer, selector, locator.

**Updates available**:
The indicator on a tailored CV showing that its master has changed in a way that has not been reviewed yet. Reflects the difference between the master and the tailored copy's [[sync baseline]], ignoring blocks hidden on either side.
_Avoid_: Outdated, stale, behind

**Orphaned tailored CV**:
A tailored CV whose master no longer exists. Functionally equivalent to a standalone CV: no sync indicator, no baseline, no remembered link. Reached either through the dashboard's master-delete dialog (the "Keep as standalone" choice) or silently on load when the linked master is unreachable.
_Avoid_: Detached, broken, dangling

### Surfaces

**Dashboard**:
The CV list view, grouped by master with tailored copies nested underneath. Hosts fuzzy search and the master / tailored group filter.
_Avoid_: Home, library, list page

**Preview**:
The right-side pane in the editor that renders the live PDF of the current CV, page-for-page identical to what would be exported.
_Avoid_: Render, output, view

**Theme**:
A self-contained rendering module that takes filtered CV blocks and produces a PDF layout. The v1 theme is "Classic." Adding a theme means adding a module, not changing the editor or the data.
_Avoid_: Template, style, layout

### Offline & durability

**Install**:
Adding HumbleHire to the device so it runs as a standalone app in its own window. Beyond the native-app feel, installing is the lever that makes local storage durable: on Chrome it unlocks the persistent-storage grant, on iOS it exempts the data from periodic clean-up. Product copy ties the two together ("Install to protect your CVs").
_Avoid_: Download, "get the app", add to desktop (used loosely).

**Offline-ready**:
The state in which the app shell and the PDF engine are cached so HumbleHire opens, edits, previews, and exports with no network. Reached after the first online visit.
_Avoid_: Offline mode (implies a user-toggled state), offline-only.

**Durable storage**:
Browser storage exempt from automatic eviction, so CV content survives storage pressure and a browser's periodic clean-up. Reinforced by [[install]]. Describes resistance to eviction on _this device_; it never implies an off-device copy.
_Avoid_: "Saved to cloud", "backed up" (durable is not the same as backed up), permanent.

**Export**:
Turning a single CV into a downloadable file: a PDF for an employer, or a structured JSON file for re-import or use in other tools. Structured exports can be re-imported into HumbleHire.
_Avoid_: Backup, save.

**Import**:
Bringing a structured file into HumbleHire as a new CV, the inverse of a structured [[export]]. Accepts the same structured formats HumbleHire exports.
_Avoid_: Upload, load, restore (restore belongs to [[backup]]).

**Backup**:
A single downloadable file containing every CV at once, re-importable to restore them. The copy that survives cleared site data, a different browser, or a dead disk. Distinct from [[export]] and [[import]], which work one CV at a time.
_Avoid_: Export, dump, save.

### Serialization

**Serialization**:
The feature that owns structured [[export]] and [[import]] in both directions, together with the rules that validate incoming files. Names the whole bridge between a CV inside the app and its file form, not just the export half.
_Avoid_: Export (one direction only), mapping (too narrow).

**DB schema**:
The shape of locally stored CV data in the browser database. Carries its own version, the storage migration number, raised when the stored shape changes. Unrelated to a CV's content and to the [[json schema]].
_Avoid_: Schema (unqualified), storage schema.

**JSON schema**:
The shape every structured [[export]] and [[import]] file must conform to, and the contract incoming files are checked against. Carries its own version, the JSON schema version, raised when the file format changes. Not to be confused with JSON Schema, the external validation standard (json-schema.org) used to express it, nor with [[json resume]], the resume standard it builds on.
_Avoid_: Schema (unqualified); do not conflate with the JSON Schema standard.

**HumbleHire JSON**:
The lossless structured [[export]] variant (`.humblehire.json`). Keeps HumbleHire's extra fields so a file round-trips exactly.
_Avoid_: Native format, full export.

**JSON Resume**:
Both the external standard HumbleHire interoperates with and the lossy [[export]] variant (`.json`) projected onto it. The variant drops HumbleHire's extra fields. When the variant is meant, say "JSON Resume export."
_Avoid_: Standard format, plain export (unqualified).

**Coercion**:
A best-effort conversion between a HumbleHire shape and a JSON Resume shape. Two kinds stay distinct. _Durable_ coercions are the permanent gap between a CV inside the app and its file form, and they outlive any refactor. _Temporal_ coercions exist only because the app's current CV shape differs from the file shape; a planned refactor adopts JSON Resume's structures and removes them.
_Avoid_: Mapping (reserve for direct field-to-field correspondence), hack, workaround.

## Flagged ambiguities

**"Block" is being redefined by the model refactor.** The definition above ("one of the nine fixed sections") conflates three jobs that the refactor splits apart: a content grouping, a rendered section, and the unit of hide / hash / sync. The new [[runtime cv]] groups content into typed sections (basics, work, education, skills, projects) with no flat list of nine blocks. Once the step-2 presentation design lands, "Block" is expected to survive only as a _presentation_ term (a rendered section in the editor and PDF), decoupled from the content shape. Until then, treat "Block" as legacy when it appears in code.

**"Version" is ambiguous. Qualify it or avoid it.**

- A CV has no version. "CV version," "version history," "save a version," and "master version" all imply a stored history of past states that does not exist. For a particular captured state of a CV, use [[snapshot]]. For a derived copy, use [[tailored cv]]; for the agreed comparison point, use [[sync baseline]].
- Two things legitimately carry a version, and each must say which: the [[db schema]] version (the local storage shape) and the [[json schema]] version (the file format). Never write "schema version" unqualified.

**"Schema" is ambiguous. Always qualify.** Say [[db schema]] or [[json schema]]. Bare "schema" could mean either, and "JSON schema" additionally risks reading as the JSON Schema standard.

**"Update" is overloaded. Keep the two senses apart.**

- _Sync sense (reserved)_: "Updates available" / "updated" is the tailored-CV indicator that its master changed. See [[updates available]]. Only sync uses this word.
- _App sense_: when a new build is deployed and a fresh version of the app is ready, the reload prompt must **not** say "update available." Use "a new version of HumbleHire is available" and "Reload." This keeps "updates" unambiguously about sync.

## Example dialogue

> **Dev**: When the user clicks Sync on a tailored CV, what exactly do they see?
>
> **PM**: A list of diff items. Each one is a single change the master made since the last time this tailored CV synced. Could be a text edit on Position, a new job entry in Job History, or just one new achievement inside an existing job. Each item has Accept and Discard buttons.
>
> **Dev**: And if they discard one, does it come back next time?
>
> **PM**: Not until the master changes again. We remember the discard against the master as it stood then. Once the master moves on, the diff is recomputed and that item may or may not reappear, depending on whether it is still a real difference.
>
> **Dev**: What about pushing a tailored edit back into the master?
>
> **PM**: Not a thing. Sync is master into tailored, full stop. A good edit on a tailored copy has to be re-entered into the master by hand.
>
> **Dev**: And tailored copies of tailored copies?
>
> **PM**: Also not a thing. Tailored CVs always derive from a master.
