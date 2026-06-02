#!/usr/bin/env node
// Real entry point for the `docs-assets` CLI. The harness is written in
// TypeScript and run without a build step, so we register tsx's loader and then
// hand off to the TS entry. `pnpm --filter @humblehire/docs-assets generate`
// runs the same code via the `generate` script.
import { register } from 'tsx/esm/api';

register();
await import(new URL('../src/cli.ts', import.meta.url).href);
