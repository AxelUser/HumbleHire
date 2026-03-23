# PRD: Tailoring & Versioning

## Overview

Tailoring & Versioning is how users create job-specific copies of their master CV without losing track of what changed or where.
You start a tailored copy from your master, customise it for a role or company, and pull in updates from the master when it changes.

This feature builds on the [CV Editor](../cv-editor/PRD.md), which handles editing a
single CV. Tailoring adds the relationships _between_ CVs.

---

## Problem

Job seekers maintain a comprehensive master CV and tailor it per application. The
typical workflow:

1. Copy the master document (Google Doc, Word file).
2. Edit the copy for a target role: hide irrelevant experience, tweak bullet points,
   adjust the title.
3. Export to PDF and apply.
4. Repeat for every application.

A few copies in, this gets messy. There's no lineage, so files like
`cv_v3_senior_backend_engineer_FINAL2.pdf` pile up with no clear record of what came from what. When
the master changes (new job, new certification), each copy needs a manual pass. And
when you want to recall what you sent to a company, it may be hard to find the exact version.

---

## Goals

- Let users create tailored CVs from any existing CV.
- Track which CV a tailored copy was derived from and when.
- Notify users when the master CV has changed since the tailored copy was created.
- Let users selectively pull changes from the master into a tailored CV.

## Non-goals

- Exporting to PDF/HTML/Markdown is out of scope here — it's next on the roadmap.
- Multi-level tailoring (a tailored CV derived from another tailored CV). Tailored CVs always derive from a master CV.
- Automatic merging or conflict resolution. Sync is always manual and selective.
- Diffing UI with inline highlighting (but this is a potential future enhancement).
- Collaborative editing or shared CVs.

---

## Concepts

### Master CV

A regular CV (created via the CV Editor) that the user designates as their
comprehensive career record. There is nothing structurally special about a master CV;
any CV can serve as a tailoring source. The term "master" is a user convention, not a
system constraint.

### Tailored CV

A new CV created by copying from a master CV at a specific point in time. A tailored CV:

- Starts as a full copy of the master CV's blocks and visibility settings.
- Records which CV it was tailored from and when (i.e. from what version of the master CV).
- Is fully independent after creation: edits to the tailored CV do not affect the master,
  and vice versa.
- Can check for updates from its master and selectively accept them.

---

## User stories

### Creating a tailored CV

- As a user, I can create a tailored CV from any CV on the dashboard.
- As a user, I am prompted to name the tailored CV when creating it (e.g., "Stripe - Senior
  Frontend").
- As a user, the new tailored CV opens in the editor immediately, pre-filled with all
  content from the master CV.
- As a user, I can optionally see all tailored CVs on the dashboard.

### Editing a tailored CV

- As a user, I edit a tailored CV exactly like any other CV; the editor experience is
  identical.
- As a user, I can hide blocks that aren't relevant to the target role without deleting
  content.
- As a user, I can tweak any field without affecting the master CV.

### Syncing from master

- As a user, I can see on the dashboard or in the editor whether my master CV has
  changed since I created the tailored copy.
- As a user, I can open a diff view against the current master at any time and
  selectively apply changes.
- As a user, I can dismiss the "updates available" indicator if I decide the changes
  aren't relevant to this tailored CV.
- As a user, I will see "updates available" indicator on the tailored CV if only the changes where made on data that is used in the tailored CV.

### Tailored CV indicators on the dashboard

- As a user, I can see which CVs are tailored copies and which CV they were derived from.
- As a user, I can see an "updates available" badge on tailored CVs whose master has
  changed.
- As a user, I can filter the dashboard to show only master CVs or only tailored CVs.

---

## UX behaviour

### Tailored CV creation flow

1. User clicks "Tailor" on a CV card (dashboard) or from within the editor toolbar.
2. A modal asks for the tailored CV name (required) and optional notes (e.g., "Tailored for
   their ML team").
3. On confirm, a new CV is created as a full copy of the master's blocks, with a reference back to the master stored in metadata.
4. The editor opens on the new tailored CV.

### Sync indicator

When the master CV changes, a subtle indicator (e.g., badge or dot) appears on the tailored CV. The user can open a diff view against the current master at any time and selectively apply changes. The indicator is informational, not blocking, and can be dismissed.

---

## Acceptance criteria

| ID   | Criterion                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------- |
| TC-1 | A tailored CV can be created from any CV; it contains a full copy of the master's blocks and visibility. |
| TC-2 | The tailored CV records its master CV ID and the timestamp at which it was tailored.                     |
| TC-3 | Editing a tailored CV does not modify the master CV.                                                     |
| TC-4 | Dashboard shows tailoring lineage (which CV a tailored copy derives from).                               |
| TC-5 | Dashboard shows an "updates available" indicator when the master CV changed after tailoring.             |
| TC-6 | Sync view shows differences between the tailored CV and the current master.                              |
| TC-7 | User can selectively apply or skip changes during sync.                                                  |
| TC-8 | After sync review, the "updates available" indicator clears.                                             |

---

## Open questions

1. **Should deleting a master CV orphan its tailored CVs or block deletion?** Leaning
   toward user control: the system should prompt the user to delete tailored CVs when deleting a master, or tailored CVs become standalone CVs and the sync indicator disappears.
2. **Should sync work in the other direction?** (i.e. tailored CV back to master, to pull a good edit
   back.) Could be useful but adds complexity. Deferring for now.
3. **Should tailored CVs be derivable from other tailored CVs?** This would allow for more layered scenarios — one tailored CV for a specific role, another derived from that for a specific company — but could get confusing quickly. Deferring for now.
4. **Should the "updates available" notification be scoped to only the data blocks that were actually used in the tailored CV (e.g. bullet points, job history records that appear in it), rather than any change to the master?** Yes, this is valid point, anyway diff should keep track of all changes per block, so we can show the user what exactly has changed on data it uses.
