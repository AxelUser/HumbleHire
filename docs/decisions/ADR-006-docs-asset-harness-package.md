# ADR-006: Docs-asset harness as its own package, driven by a CLI

- **Status**: Accepted
- **Date**: 2026-06-02
- **Feature**: tooling

---

## Context

The documentation screenshots and GIFs are produced by driving the real app in a
headless browser (seeding through the `window.__hhTest` bridge, per ADR-004). That
harness started life as a set of `*.assets.ts` files run by a second Playwright
config (`playwright.assets.config.ts`), living inside the app package.

Two things about that arrangement grated:

1. **`ffmpeg-static` sat in the app's manifest.** It downloads a ~50 MB binary on
   install and is imported by exactly one file in the harness — nothing in `src/`
   or the e2e suite touches it. Every app install, and every CI lane that does a
   plain `pnpm install`, paid for a binary the app never uses.
2. **The captures were shaped like tests but aren't.** They never assert; they
   produce artifacts. Riding on `@playwright/test` meant the harness inherited a
   test runner's semantics (retries, reporters, the projects matrix, fixtures)
   to do a task runner's job, and the only real coupling to the framework was
   `testInfo.project.name` standing in for the light/dark theme.

## Decision

**The harness is its own workspace package, `@humblehire/docs-assets`, and runs as
a CLI over the Playwright library rather than as Playwright tests.**

The repo was already a pnpm workspace with a single package (`.`); this adds two
siblings rather than introducing a monorepo from scratch. `ffmpeg-static` and the
browser-driving `playwright` library move into the new package, so the app's
manifest no longer carries either. Whether a given `pnpm install` fetches the
ffmpeg binary is now a workspace-filter decision (install the app package alone and
it never appears), not a property of the app.

Each capture is a **recipe** — a plain `async ({ browser, theme, outDir }) =>` in a
registry the CLI enumerates. A small `server` module replaces the bits of
`@playwright/test`'s `webServer` the harness actually used: build the app with
`VITE_E2E` so the bridge is compiled in, preview it, wait on the port, drive every
recipe across both themes with one Chromium, then tear the preview tree down. The
entry point is `docs-assets generate` (also reachable as `pnpm assets:generate`
from the root, the name that already existed).

The dead `mouse-helper` dependency — referenced only in a comment that explained
why it is _not_ used — was dropped in the same change.

## The bridge contract moved out too

The harness and the e2e suite both seed through `useBridge`, and that adapter plus
its types (`HhTestBridge`, `MasterSeedContent`) were duplicated and reached into
the app via the `$lib` alias. Once the harness became a separate package, `$lib`
no longer resolved for it, so the shared contract had to live somewhere both
packages can import.

It now lives in `@humblehire/test-bridge`: the interface types and the `useBridge`
adapter, in one place. The app's `initE2eBridge` implements against those types
(a type-only import, erased at build), the e2e suite imports `useBridge` from it,
and so does the harness. The `Page` parameter is typed structurally (only
`evaluate` and `waitForFunction`), so the contract carries no Playwright
dependency and tolerates the e2e suite and the harness pinning different Playwright
versions.

## Consequences

- The app's dependency manifest no longer mentions ffmpeg or a second Playwright
  config. Locality: the binary lives in the package that uses it.
- The captures read as what they are — capture scripts, not tests. Adding one is a
  recipe module plus a line in the registry.
- The harness owns ~40 lines of server-lifecycle code that the test runner used to
  provide (process spawn, wait-on-port, `taskkill /T` on Windows). This is the
  cost of dropping the runner, and it is small and self-contained.
- Three packages now: the app (root), `@humblehire/test-bridge`, and
  `@humblehire/docs-assets`. A future architecture review should not propose
  folding the harness back into the app — the split is what keeps ffmpeg out of
  the app's manifest, and the CLI is what keeps the captures from masquerading as
  tests.
- The harness is still not part of CI (it builds the app and drives a browser);
  it is run on demand when the documentation visuals need refreshing.
