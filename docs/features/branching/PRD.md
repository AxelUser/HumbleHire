# PRD: Branching & Versioning

## Overview

Branching & Versioning lets users derive tailored CV variants from a master CV and keep them in sync. Instead of copying entire documents and losing track of changes, users branch from a source CV, customise the branch for a specific role or company, and selectively pull updates when the source changes.

This feature builds on top of the [CV Editor](../cv-editor/PRD.md), which handles editing a single CV. Branching adds the relationships _between_ CVs.

---

## Problem

Job seekers maintain a comprehensive "master" CV and tailor it per application. The typical workflow today:

1. Copy the master document (Google Doc, Word file).
2. Edit the copy for a target role — hide irrelevant experience, tweak bullet points, adjust the title.
3. Export to PDF and apply.
4. Repeat for every application.

This breaks down quickly:

- **Lost lineage.** After a few copies, it's unclear which version derives from what. Files like `cv_v3_google_FINAL2.pdf` pile up.
- **Painful propagation.** When the master changes (new job, new skill, new certification), every copy must be manually updated.
- **No recall.** Weeks later, when a recruiter calls, the user can't easily find what they actually sent to that company.

---

## Goals

- Let users create branches (tailored variants) from any existing CV.
- Track which CV a branch was derived from and when.
- Notify users when the source CV has changed since the branch was created.
- Let users selectively pull changes from the source into a branch (block-level sync).
- Automatically snapshot the CV state when exporting, so users can recall what was sent where.

## Non-goals

- Multi-level branching (branch of a branch). Branches always derive from a direct source CV.
- Automatic merging or conflict resolution. Sync is always manual and selective.
- Diffing UI with inline highlighting (potential future enhancement).
- Collaborative editing or shared branches.

---

## Concepts

### Master CV

A regular CV (created via the CV Editor) that the user designates as their comprehensive career record. There is nothing structurally special about a master CV — any CV can serve as a branch source. The term "master" is a user convention, not a system constraint.

### Branch

A new CV created by forking from a source CV at a specific point in time. A branch:

- Starts as a full copy of the source CV's blocks and visibility settings.
- Records which CV it was branched from and when (the "branch point").
- Is fully independent after creation — edits to the branch do not affect the source, and vice versa.
- Can check for updates from its source and selectively accept them.

### Export snapshot

A read-only, timestamped copy of a CV's blocks captured automatically when the user exports (e.g., to PDF). Export snapshots answer the question: "What exactly did I send to Company X?"

---

## User stories

### Creating a branch

- As a user, I can create a branch from any CV on the dashboard.
- As a user, I am prompted to name the branch when creating it (e.g., "Stripe — Senior Frontend").
- As a user, the new branch opens in the editor immediately, pre-filled with all content from the source CV.

### Editing a branch

- As a user, I edit a branch exactly like any other CV — the editor experience is identical.
- As a user, I can hide blocks that aren't relevant to the target role without deleting content.
- As a user, I can tweak any field without affecting the source CV.

### Syncing from source

- As a user, I can see on the dashboard or in the editor whether my source CV has changed since I branched.
- As a user, I can open a "Sync from source" view that shows which blocks differ between my branch and the current source.
- As a user, I can accept or skip each changed block individually — I am never forced to take all changes.
- As a user, I can dismiss the "updates available" indicator if I decide the changes aren't relevant to this branch.

### Branch awareness on the dashboard

- As a user, I can see which CVs are branches and which CV they were branched from.
- As a user, I can see an "updates available" badge on branches whose source has changed.
- As a user, I can filter the dashboard to show only master CVs or only branches.

### Export snapshots

- As a user, when I export a CV to PDF, a snapshot is automatically saved with a timestamp.
- As a user, I can optionally tag the snapshot with a company name or job title at export time.
- As a user, I can view a list of export snapshots for any CV and see what was sent and when.
- As a user, I can open a read-only view of any past export snapshot.

---

## UX behaviour

### Branch creation flow

1. User clicks "Branch" on a CV card (dashboard) or from within the editor toolbar.
2. A modal asks for the branch name (required) and optional notes (e.g., "Tailored for their ML team").
3. On confirm: a new CV is created with a full copy of the source's blocks, linked to the source via metadata.
4. The user is navigated to the new branch in the editor.

### Sync indicator

- A subtle indicator (e.g., badge or dot) appears on branches when the source CV's `updatedAt` is newer than the branch's `branchedAt` timestamp.
- The indicator is informational, not blocking — the user can ignore it indefinitely.

### Sync review

- The sync view shows a block-by-block comparison: for each block that differs, the user sees the source version and their branch version side by side.
- Each block has an "Accept" (replace branch block with source) or "Skip" (keep branch block) action.
- After reviewing all blocks, the branch's `branchedAt` is updated to the source's current `updatedAt`, clearing the indicator.

### Export snapshot capture

- Snapshots are captured silently during export — no extra modal or confirmation.
- The optional company/role tag is part of the export dialog itself (one extra field).

---

## Acceptance criteria

| ID   | Criterion                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| BR-1 | A branch can be created from any CV; the branch contains a full copy of the source's blocks and visibility.  |
| BR-2 | Branch records its source CV ID and the timestamp at which it was branched.                                   |
| BR-3 | Editing a branch does not modify the source CV.                                                              |
| BR-4 | Dashboard shows branch lineage (which CV a branch derives from).                                             |
| BR-5 | Dashboard shows an "updates available" indicator when the source CV changed after branching.                  |
| BR-6 | Sync view shows block-level differences between branch and current source.                                   |
| BR-7 | User can accept or skip each block change individually during sync.                                          |
| BR-8 | After sync review, the "updates available" indicator clears.                                                 |
| BR-9 | Exporting a CV automatically creates a timestamped, read-only snapshot.                                      |
| BR-10| Export snapshots can be tagged with a company name or job title.                                              |
| BR-11| Past export snapshots are viewable in a read-only mode from the CV's detail view.                            |

---

## Open questions

1. **Should deleting a source CV orphan its branches or block deletion?** Leaning toward orphaning — branches become standalone CVs, and the sync indicator simply disappears.
2. **Should sync be available in the other direction?** (branch → source, to pull a good edit back into master.) Could be useful but adds complexity. Deferring for now.
3. **Should there be a limit on export snapshots per CV?** Storage is local, so probably not — but a cleanup option may be helpful.
