# ADR-002: Build PDFs in the browser rather than using the print dialog

- **Status**: Accepted
- **Date**: 2026-05-20
- **Feature**: export

---

## Context

HumbleHire is a local-first, static SvelteKit application with no backend. Exporting a CV to PDF therefore has to happen entirely in the browser.

Two paths were considered:

1. **Browser print pipeline.** Render a print-only HTML view, control layout with `@page` and `break-inside` CSS rules, and trigger `window.print()`. The user picks "Save as PDF" in the OS dialog.
2. **Client-side PDF construction.** Build the PDF bytes directly in the browser from the CV data and hand the user a download.

The editor is also gaining a side-by-side live preview of the exported document. That preview has to match what the user actually gets when they export.

---

## Decision

Build the PDF in the browser from the CV data, and download it directly when the user exports. The side-by-side preview in the editor renders the same PDF onto a canvas, so what the user sees in the editor is exactly what the saved file will contain.

The browser print pipeline is rejected for HumbleHire.

---

## Rationale

### One-click download matters here

A print dialog is an extra friction step for every export. Job seekers using HumbleHire export the same CV many times across an application cycle, and routing each export through a system dialog where they have to pick a destination, confirm a filename, and remember to disable headers and footers is real cost. A direct download removes that friction entirely.

### Cross-browser output is inconsistent through print

Different browsers ship different print engines. Page break behaviour, default headers and footers, web font embedding, and background color handling each diverge in ways the application cannot control from CSS. A CV that looks correct when printed from one browser may look subtly different when printed from another. For a tool whose only output is the PDF, that variance is worth avoiding.

### Mobile support is part of the value

HumbleHire is meant to be useful on whatever device the user happens to be on. Mobile browsers' print pipelines are partial at best. iOS Safari routes through AirPrint or Save to Files and ignores parts of the print stylesheet, and Android support varies by browser. Building the PDF in code sidesteps the mobile print problem entirely; the same code path works on every platform that runs the app.

### The preview can be exact, not approximate

With the print pipeline, the editor preview would be HTML styled to look like the print output, which is close but not identical. With client-side construction, the preview is the actual PDF rendered onto a canvas — pixel for pixel, what the user will see in the downloaded file. For a side-by-side editor where the preview is meant to give confidence in the export, exact is meaningfully better than close.

### ATS compatibility is preserved

Applicant tracking systems need to parse text out of the PDF. As long as PDF construction uses real text primitives rather than rasterising the layout to an image, the resulting file remains parseable. This is a constraint on how the export is built, not a comparison point between the two paths.

---

## Consequences

### Positive

- The export is one click. No dialog, no per-export configuration.
- The output looks the same regardless of which browser or OS the user is on.
- The editor preview is byte-accurate to the file the user downloads.
- Mobile users get the same workflow as desktop users.
- The download is a real file the application controls — naming, timing, and downstream use all stay local to the app.

### Negative / Trade-offs

- Each theme has to be implemented in the PDF rendering layer rather than as a stylesheet. Adding a new theme is more work than dropping in CSS.
- The PDF rendering library and the PDF-to-canvas renderer add to the bundle. Acceptable for a tool the user opens deliberately, but a real cost.
- Layout primitives in PDF rendering libraries are coarser than CSS. Some visual effects available in HTML are inconvenient or impossible in the PDF layer.
- Debugging layout requires opening the generated PDF; the browser devtools do not see into PDF rendering directly.
