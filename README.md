# HumbleHire

> One CV. Many targets.

## What it is

A free, open-source CV builder. Everything runs on your own machine. You write CVs, organise tailored copies for each application, and export PDFs to send.

Full project overview: `[docs/OVERVIEW.md](docs/OVERVIEW.md)`.

[Check it out](https://humblehire.cv)

## Features

- **[Editor](docs/features/cv-editor/OVERVIEW.md)** — write all about yourself and see the resulted CV in a side-by-side preview. Changes save automatically. Any block can be hidden without losing its content.
- **[Tailoring](docs/features/tailoring/OVERVIEW.md)** — branch off tailored copies from a master CV. When the master changes, decide change-by-change what gets pulled into each tailored copy.
- **[Dashboard](docs/features/dashboard/OVERVIEW.md)** — all your CVs in one place, grouped by master with fuzzy search.
- **[Export](docs/features/export/OVERVIEW.md)** — one click PDF download. The live preview in the editor shows exactly what the file will be.

## Built with

- [Svelte 5](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)

## Running locally

The project uses [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev           # start the dev server
pnpm build         # production build (as a static site)
pnpm test:unit     # unit tests
pnpm test:e2e      # end-to-end tests
pnpm storybook     # test components in isolation
```

## Documentation

- `[docs/OVERVIEW.md](docs/OVERVIEW.md)` — project overview
- `[docs/features/](docs/features/)` — per-feature explanations

## Special thanks

To the libraries doing all the the heavy lifting:

- **[pdfmake](https://github.com/bpampuch/pdfmake)** — generates the exported PDF in the browser
- **[PDF.js](https://github.com/mozilla/pdf.js)** — renders the live preview
- **[Dexie.js](https://dexie.org/)** — local storage layer over IndexedDB
- **[Fuse.js](https://fusejs.io/)** — fuzzy search
- **[@dnd-kit/svelte](https://github.com/dnd-kit-svelte/dnd-kit-svelte)** — for all drag-and-drop interactions
- **[Shadcn-Svelte](https://shadcn-svelte.com/)** and **[bits-ui](https://bits-ui.com/)** — main UI primitives

## License

[MIT](LICENSE) © Aleksey Maltsev
