# PRD: Export to PDF

## Overview

Export turns any CV in HumbleHire into a clean, standalone PDF that a user can attach to a job application. The PDF is built in the browser from the CV data and downloaded as a real file, with no print dialog in the way.

Alongside the export action, the editor gains a side-by-side live preview. The left side stays the block editor; the right side renders the PDF that the export would produce. The preview is the actual file the user will get, not an approximation of it.

This feature builds on the [CV Editor](../cv-editor/PRD.md). It consumes the same `CV` data structure and respects the same block visibility rules. The decision to build PDFs in the browser rather than route through the OS print dialog is recorded in [ADR-002](../../decisions/ADR-002-client-side-pdf-generation.md).

---

## Problem

When a user finishes editing a CV in HumbleHire, they need a PDF file they can attach to an application. The editor view is built for editing, so it carries block headers, hide/show toggles, hover outlines, and spacing tuned for inline editing. None of that should reach a recruiter.

What the user needs from the export:

- A clean visual hierarchy with name, position, and contacts at the top.
- Selectable text so applicant tracking systems can parse it.
- Predictable pagination — sections and entries should not split awkwardly across pages.
- The same output whatever browser or device they happen to be on.
- A direct download, not an OS print dialog they have to configure each time.

Because HumbleHire is local-first, all of this has to happen in the browser, with no server round-trip.

---

## Goals

- Export any CV to a PDF file that downloads directly when the user clicks Export.
- Show a live, byte-accurate preview of the export inside the editor, side by side with the block editor.
- Respect block visibility — hidden blocks do not appear in the PDF or the preview.
- Keep the export consistent across browsers and devices, including mobile.
- Lay groundwork for multiple themes; ship one ("Classic") in v1.

## Non-goals

- Routing the export through the browser's print dialog.
- HTML or Markdown export (potential follow-up).
- Cover-letter export.
- User-defined themes or per-section style overrides.
- Embedded photos, icons, or charts in the CV body.
- Image-based or rasterised PDFs (the output must remain parseable as text by applicant tracking systems).

---

## How it works

The export is constructed in code from the CV data. When the user clicks Export, the application generates the PDF file and offers it for download. No print dialog, no system intermediary, no server call.

The same generation step feeds the editor's preview pane. The preview is the generated PDF, rendered into the right half of the editor. As the user edits a block on the left, the preview on the right updates to show the new state of the PDF.

The full rationale for choosing this path over the browser print pipeline is in [ADR-002](../../decisions/ADR-002-client-side-pdf-generation.md). The short version: the user gets a one-click download, the output looks the same across browsers, the workflow holds together on mobile, and the editor preview is the actual file rather than an approximation of it.

---

## Themes

The export view reads CV data once and hands it to a theme module that owns the layout. Adding a new theme means adding a new module; the editor and the data model stay untouched.

v1 ships a single theme:

| Theme   | Description                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Classic | Single-column resume. Conservative typography, name as the top focal point, sections separated by hairline rules, dates right-aligned within entries. ATS-friendly. |

The theme switcher is not exposed in the UI for v1. The infrastructure to register and select themes is in place so additional themes can be added later without touching the editor.

The Classic theme deliberately steps away from the editor's Soft Neo-Brutalist UI. Hard offset shadows, square borders, and steel-blue accents look right in an authoring tool, but they would be loud and unconventional on an actual resume. The export leans on quiet typography and hairline separators instead.

---

## User stories

### Side-by-side editor and preview

- As a user, when I open a CV in the editor I see the block editor on the left and a live preview of the export on the right.
- As a user, the preview reflects what the downloaded PDF will contain, not an approximation of it.
- As a user, edits I make on the left show up in the preview on the right shortly after I stop typing.
- As a user, hidden blocks are absent from the preview.
- As a user, I can scroll through the preview to see all pages of the resulting document.

### Triggering an export

- As a user, I can click Export in the editor and get a PDF file downloaded directly.
- As a user, I can export any CV from the dashboard without opening it first.
- As a user, the downloaded file's name is derived from the CV's name.
- As a user, exporting does not navigate me away from the editor.

### Block rendering

- As a user, my name and target position read as the visual top of the document.
- As a user, my contacts appear as a single line or compact group under the header, not as a bulleted list.
- As a user, my highlights, job history, projects, skills, and education are rendered as distinct sections with consistent headings.
- As a user, dates on jobs and education entries are formatted consistently (e.g., `Jan 2023 – Present`).
- As a user, skill and project stack tags appear inline as plain text separators, not coloured badges.
- As a user, achievement bullets and highlights render as proper list items, parseable by an ATS.

### Theming

- As a user, my CV is exported in the Classic theme by default.
- As a developer, I can add a second theme by adding a theme module, without touching the editor or the data model.

---

## Block rendering rules

The export consumes the same `CVBlocks` shape used by the editor. Each block has a defined render rule in the Classic theme.

| Block       | Classic theme rendering                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full Name   | Top of document, largest type weight                                                                                                                        |
| Position    | Directly under the name, secondary weight                                                                                                                   |
| Location    | Inline with contacts row, separated by a middle dot or pipe                                                                                                 |
| Contacts    | Single horizontal row of `label: value` items separated by a delimiter; wraps to a second line if needed                                                    |
| Highlights  | Bulleted list under a `Summary` or `Highlights` heading                                                                                                     |
| Skills      | If categorised: `Category: skill, skill, skill` per line. If flat: comma-separated inline                                                                   |
| Job History | Per entry: company + role on one line, dates right-aligned on the same line, achievements as a bulleted list, skill tags as a comma-separated trailing line |
| Projects    | Per entry: name + optional link on one line, description below, stack as a comma-separated trailing line                                                    |
| Education   | Per entry: institution + degree on one line, dates right-aligned                                                                                            |

### Visibility

- Blocks listed in `cv.hiddenBlockIds` are not rendered.
- Within repeatable blocks, individual entries do not have a visibility flag; they are rendered if their parent block is visible.
- Empty blocks (no text, no entries) are not rendered, even if visible.

### Pagination

- Section headings stay with at least the first item of their section. No orphan headings at the bottom of a page.
- Individual entries (jobs, projects, education) avoid being split across pages where reasonable.
- The full document flows naturally onto as many pages as the content needs; no explicit page count target.

---

## UX behaviour

### Editor layout

The editor view is split in two. The left side is the existing block editor. The right side is the live preview pane, sized to A4 proportions, showing the generated PDF. The two sides scroll independently.

The preview updates after the user pauses editing, so live typing does not cause the preview to thrash. The exact debounce timing is an implementation detail.

If the editor is opened on a narrow screen where a side-by-side layout would be cramped, the preview pane collapses; the user can toggle it open or closed.

### Export action

The Export action lives in the editor toolbar and on each CV card on the dashboard. Triggering it generates the PDF and starts a browser download immediately. The user stays where they were.

The downloaded file's name is derived from the CV's name, with a `.pdf` extension.

---

## Acceptance criteria

| ID    | Criterion                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| EX-1  | An Export action is available in the editor toolbar and on each CV card on the dashboard.                                 |
| EX-2  | Triggering Export downloads a PDF file directly, without opening a print dialog or navigating away from the current view. |
| EX-3  | The downloaded file's name is derived from the CV's name.                                                                 |
| EX-4  | The editor view shows a side-by-side live preview of the PDF that the export would produce.                               |
| EX-5  | The preview updates after the user pauses editing.                                                                        |
| EX-6  | Blocks listed in `hiddenBlockIds` do not appear in the preview or the exported PDF.                                       |
| EX-7  | Empty blocks do not appear in the preview or the exported PDF.                                                            |
| EX-8  | The exported PDF contains selectable, copy-able text (not a rasterised image).                                            |
| EX-9  | Section headings do not appear orphaned at the bottom of a page.                                                          |
| EX-10 | Individual job, project, and education entries do not split across pages when reasonable.                                 |
| EX-11 | The export produces visually identical output across the supported browsers and on mobile.                                |
| EX-12 | The export and preview load the CV from local storage only; no network request is made.                                   |
| EX-13 | A new theme can be added by adding a theme module, without changes to the editor or the data model.                       |

---

## Open questions

1. **What happens on very narrow screens?** The side-by-side preview only makes sense above some width. Below it, the preview collapses into a drawer.
2. **Page size.** Defaulting to A4.
3. **Photo / avatar block.** Some markets expect a photo on resumes, plus I personally don't believe in the value of a photo on a resume considering the heavy usage of ATS. Definitely not part of the v1 data model; would need a new block first.
4. **Theme preview in the UI.** Even with only one theme shipping, a placeholder selector could communicate the intent. Holding off until a second theme exists.
5. **Export from the dashboard without opening the editor.** The dashboard export action needs to generate the PDF without the side-by-side preview ever being shown. This should fall out of the architecture but is worth confirming during implementation.
