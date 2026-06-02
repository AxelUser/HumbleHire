import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// This file lives at assets/src/paths.ts, so the package root is one level up and
// the repo root is two. Everything the harness reads or writes is resolved from
// here, not from process.cwd(), so the CLI behaves the same wherever it's launched.
const here = dirname(fileURLToPath(import.meta.url));

export const PACKAGE_DIR = resolve(here, '..');
export const ROOT_DIR = resolve(PACKAGE_DIR, '..');

// Fallbacks for the CLI config (see config.ts). These apply only when a flag is
// omitted; the canonical values are spelled out in the `generate` pnpm script.
export const DEFAULT_PORT = 4888;
// Relative `--out` is resolved against the repo root, so the default reads as
// `docs/assets` at the invocation site even though the CLI runs from the package.
export const DEFAULT_OUT_DIR = resolve(ROOT_DIR, 'docs', 'assets');

// The intermediate Playwright videos go to a gitignored scratch dir inside this
// package; not user-facing, so it stays a fixed path.
export const VIDEO_DIR = resolve(PACKAGE_DIR, 'assets-output', 'videos');
