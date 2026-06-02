# Editor

The editor is where you build and revise a CV in HumbleHire. The left sidebar is the editor, the right sidebar is the preview: you see the CV as it would render.

## Blocks

Currently, a CV is composed of nine fixed blocks:

- Full Name
- Position
- Location
- Contacts
- Highlights
- Skills
- Job History
- Projects
- Education

Order is fixed; you cannot rearrange blocks. "Full Name", "Position", and "Location" hold a single text value each; the rest can hold multiple entries.

Any block can be hidden. Hidden blocks keep their content but drop out from the preview and export.

## Editing

Clicking a field opens an input in place. Typing updates the visible CV practically immediately, with a small delay for debouncing because PDF generation is CPU-intensive.

Changes are persisted (i.e. saved to the database) automatically about a second after you stop typing.

## Repeatable blocks

Contacts, Highlights, Skills, Job History, Projects, and Education each hold a list of entries. You add an entry with a button at the bottom of the block and remove it with a control on the entry itself.

A few blocks have shapes worth calling out:

- **Skills** are entered as tag badges. Type a skill, press Enter or comma, repeat. Skills can optionally be grouped into named categories (Frontend, Backend, and so on). Categories and the skills inside them can be dragged to reorder.
- **Contacts** are free-form label + value pairs. You decide the label ("GitHub", "Email", "Mastodon") and the value next to it. There is no fixed contact schema.
- **Job History** and **Projects** entries each carry their own tag list for the skills or stack used. Same tag input shape as the Skills block.
