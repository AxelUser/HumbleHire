# Export

Export turns any CV in HumbleHire into a downloadable file. The standard export is a clean PDF for job applications. Any CV can also be exported as structured JSON for re-import, use in other tools, or long-term storage.

## Preview

The editor has a live preview pane on the right that shows the PDF the export would produce. It updates a moment after you stop typing. What you see in the preview is the file you would get if you exported right now, so there is no gap between the editor view and the downloaded PDF.

On narrower screens the preview collapses into a panel you can open from the toolbar, leaving the editor full-width.

## Exporting

Export is one click. The action is available from the editor toolbar and on each CV card on the dashboard. Triggering it downloads a PDF file directly. The downloaded filename is taken from the CV's name.

Hidden blocks are excluded from the export, as are blocks with no content.

## Themes

A theme controls how the CV data lays out on the page. Currently, there is only **Classic** theme: single column, conservative typography, name and position as the top focal point, sections separated by hairline rules. Text is real selectable text, so the file stays parseable by applicant tracking systems.

## Structured export (JSON)

Alongside the PDF, any CV can be exported as a structured JSON file. Two variants are available.

**HumbleHire JSON** (`.humblehire.json`) is the lossless variant. It stores every field, including HumbleHire-specific data, so a file exported in this format imports back without loss.

**JSON Resume** (`.json`) is the interop variant, projected onto the [JSON Resume](https://jsonresume.org) open standard ([schema v0.0.1](https://humblehire.cv/schema/resume/v0.0.1.json)). Use it when moving data to another tool or feeding it to an external service. Some HumbleHire-specific fields — highlights as discrete bullets, per-role keywords — are collapsed to fit the standard, so this variant is not a lossless round-trip.

Structured JSON exports can be re-imported into HumbleHire. Hidden blocks are not included in either JSON export format.

## Background

The choice to build the PDF directly rather than going through the browser's print dialog is recorded in [ADR-002](../../decisions/ADR-002-client-side-pdf-generation.md). The decision to use a separate DTO for structured exports, and the schema both JSON variants conform to, are recorded in [ADR-006](../../decisions/ADR-006-export-import-schema-as-dto.md) and [ADR-008](../../decisions/ADR-008-self-contained-schema.md).
