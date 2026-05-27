# Editor

The editor is where you build and revise a CV in HumbleHire. The preview and the editor are the same surface: you see the CV as it would render, and click any field to change it. There is no separate "edit" mode and no save button.

## Blocks

A CV is composed of nine fixed blocks: Full Name, Position, Location, Contacts, Highlights, Skills, Job History, Projects, Education. Order is fixed; you cannot rearrange blocks. The first three hold a single text value each; the rest can hold multiple entries.

Any block can be hidden. Hidden blocks keep their content but drop out of the export, which matters most when one tailored CV needs Education shown and another needs it dropped.

## Editing

Clicking a field opens an input in place. Typing updates the visible CV immediately. Pressing Escape or clicking elsewhere closes the field. Tab moves to the next editable field, so you can fill out a block top-to-bottom without leaving the keyboard.

Changes save automatically about a second after you stop typing. A small status line shows when the most recent save happened.

## Repeatable blocks

Contacts, Highlights, Skills, Job History, Projects, and Education each hold a list of entries. You add an entry with a button at the bottom of the block and remove it with a control on the entry itself.

A few blocks have shapes worth calling out:

- **Skills** are entered as tag badges. Type a skill, press Enter or comma, repeat. Skills can optionally be grouped into named categories (Frontend, Backend, and so on). Categories and the skills inside them can be dragged to reorder.
- **Contacts** are free-form label + value pairs. You decide the label ("GitHub", "Email", "Mastodon") and the value next to it. There is no fixed contact schema.
- **Job History** and **Projects** entries each carry their own tag list for the skills or stack used. Same tag input shape as the Skills block.
