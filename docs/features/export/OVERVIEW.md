# Export

Export turns any CV in HumbleHire into a clean PDF you can attach to a job application. The export is built from the same data shown in the editor, with hidden and empty blocks removed, and downloads as a single file with no dialog in the way.

## Preview

The editor has a live preview pane on the right that shows the PDF the export would produce. It updates a moment after you stop typing. What you see in the preview is the file you would get if you exported right now, so there is no gap between the editor view and the downloaded PDF.

On narrower screens the preview collapses into a panel you can open from the toolbar, leaving the editor full-width.

## Exporting

Export is one click. The action is available from the editor toolbar and on each CV card on the dashboard. Triggering it downloads a PDF file directly. The downloaded filename is taken from the CV's name.

Hidden blocks are excluded from the export, as are blocks with no content.

## Themes

A theme controls how the CV data lays out on the page. Currently, there is only **Classic** theme: single column, conservative typography, name and position as the top focal point, sections separated by hairline rules. Text is real selectable text, so the file stays parseable by applicant tracking systems.

## Background

The choice to build the PDF directly rather than going through the browser's print dialog is recorded in [ADR-002](../../decisions/ADR-002-client-side-pdf-generation.md).
