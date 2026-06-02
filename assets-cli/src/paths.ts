import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// This file lives at assets/src/paths.ts, so the package root is one level up and
// the repo root is two. Everything the harness reads or writes is resolved from
// here, not from process.cwd(), so the CLI behaves the same wherever it's launched.
const here = dirname(fileURLToPath(import.meta.url));

export const PACKAGE_DIR = resolve(here, '..');
export const ROOT_DIR = resolve(PACKAGE_DIR, '..');

// The app preview the harness drives. VITE_E2E is set when building it so the
// window.__hhTest seam is present.
export const PORT = 4888;
export const BASE_URL = `http://localhost:${PORT}`;

// Committed artifacts land in the repo's docs/assets; the intermediate Playwright
// videos go to a gitignored scratch dir inside this package.
export const OUT_DIR = resolve(ROOT_DIR, 'docs', 'assets');
export const VIDEO_DIR = resolve(PACKAGE_DIR, 'assets-output', 'videos');
