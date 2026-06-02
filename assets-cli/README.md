# docs-assets

A CLI that regenerates the HumbleHire documentation screenshots and GIFs. It
builds the app, drives it in a headless Chromium browser, captures every screen,
and writes the output to `docs/assets`. Run it whenever the UI changes and the
documentation visuals need refreshing.

## Prerequisites

Node 22+, pnpm 10+, and a Playwright Chromium installation:

```sh
pnpm --filter @humblehire/docs-assets exec playwright install chromium
```

`ffmpeg-static` ships with the package — no separate ffmpeg install needed.

## Running

From the repo root:

```sh
pnpm assets:generate
```

This builds the app (with the test bridge compiled in), spins up a preview server,
captures all 12 artifacts across light and dark themes, and shuts the server down.
Output lands in `docs/assets/`.

You can also run it directly with custom flags:

```sh
pnpm --filter @humblehire/docs-assets exec docs-assets generate [flags]
```

## Flags

| Flag                  | Default       |                                                              |
| --------------------- | ------------- | ------------------------------------------------------------ |
| `--out <dir>`         | `docs/assets` | Output directory. Relative paths resolve from the repo root. |
| `--themes <list>`     | `light,dark`  | Comma-separated themes to capture.                           |
| `--port <n>`          | `4888`        | Port for the app preview server.                             |
| `--scale <n>`         | `2`           | `deviceScaleFactor` for PNG stills.                          |
| `--timeout <ms>`      | `120000`      | Per-capture wall-clock limit.                                |
| `--fps <n>`           | `10`          | GIF frame rate.                                              |
| `--colors <n>`        | `96`          | GIF palette size (2–256).                                    |
| `--width <px>`        | `900`         | GIF output width; height follows the aspect ratio.           |
| `--dither <mode>`     | `bayer`       | `bayer` · `sierra2` · `none` — see below.                    |
| `--bayer-scale <0-5>` | `3`           | Bayer matrix size. Only applies with `--dither bayer`.       |

### Choosing a dither mode

The dither mode is the main lever on GIF file size:

- **`bayer`** (default) — ordered dithering. Slightly coarser in smooth gradients
  but keeps file size small because it adds no per-pixel noise between frames.
  The right choice for UI recordings.
- **`sierra2`** — full error-diffusion dithering. Smoothest, largest files.
  Use when gradient quality matters more than size.
- **`none`** — no dithering. Smallest files, visible banding in gradients.

Example — re-run just dark theme with higher quality:

```sh
pnpm --filter @humblehire/docs-assets exec docs-assets generate \
  --themes dark --dither sierra2 --colors 192 --out /tmp/hh-preview
```

## Adding a capture

1. Create `src/recipes/<name>.ts` and export a `Recipe` object:

```ts
import type { Recipe } from '../recipe';
import { makePngContext, openPage, gotoHome, captureScreenshot } from '../helpers/context';
import { join } from 'node:path';

export const myScreen: Recipe = {
	name: 'my-screen.png',
	async run(ctx) {
		const { theme, outDir } = ctx;
		const context = await makePngContext(ctx);
		const page = await openPage(context);
		try {
			await gotoHome(page);
			// ... drive the app ...
			await captureScreenshot(page, join(outDir, `my-screen.${theme}.png`));
		} finally {
			await context.close();
		}
	}
};
```

2. Add it to `src/registry.ts`.

For a GIF, use `makeGifContext` and `videoToGif` instead — see any existing recipe
in `src/recipes/` for the full pattern with the `Recorder` trim window.

## Output

| File                                | Kind   | What it shows                                      |
| ----------------------------------- | ------ | -------------------------------------------------- |
| `dashboard.{light,dark}.png`        | still  | The CV list grouped by master                      |
| `editor.{light,dark}.png`           | still  | The editor with a live PDF preview                 |
| `editor.{light,dark}.gif`           | motion | Adding a highlight and watching the preview update |
| `export.{light,dark}.gif`           | motion | Exporting a CV to PDF from the dashboard           |
| `dashboard-search.{light,dark}.gif` | motion | Searching and clearing the CV list                 |
| `tailoring.{light,dark}.gif`        | motion | Reviewing and applying sync changes from a master  |
