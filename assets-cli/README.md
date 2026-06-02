# @humblehire/docs-assets

The documentation-asset harness: a CLI that builds the HumbleHire app, drives it
in a headless browser, and regenerates the screenshots and GIFs under
`docs/assets`. It produces artifacts, it does not assert — these are capture
scripts, not tests. See [ADR-006](../docs/decisions/ADR-006-docs-asset-harness-package.md).

## Usage

From the repo root:

```sh
pnpm assets:generate
```

or from anywhere in the workspace:

```sh
pnpm --filter @humblehire/docs-assets generate
# or, via the bin:
pnpm --filter @humblehire/docs-assets exec docs-assets generate
```

`generate` builds the app with `VITE_E2E` (so the [`window.__hhTest`
bridge](../test-bridge) is present), previews it on port 4888, captures every
recipe in both light and dark, and tears the preview down. It overwrites the
committed files in `docs/assets`.

## Layout

- `src/recipes/` — one module per capture; each exports a `Recipe`.
- `src/registry.ts` — the list of recipes the CLI runs. Add a capture here.
- `src/runner.ts` — drives every recipe across both themes with one browser.
- `src/server.ts` — builds, previews, waits on the port, and kills the tree.
- `src/helpers/` — browser context setup, the brutalist cursor, eased mouse
  motion, cinematic zoom, the recorder, and ffmpeg GIF encoding.

## Requirements

A Playwright Chromium build must be installed:

```sh
pnpm --filter @humblehire/docs-assets exec playwright install chromium
```

`ffmpeg-static` provides the encoder binary and installs with the package.
