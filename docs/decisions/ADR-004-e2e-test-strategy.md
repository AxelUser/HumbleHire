# ADR-004: E2E test strategy — seeding through a flagged window bridge

- **Status**: Accepted
- **Date**: 2026-05-30
- **Feature**: testing

---

The app needed Playwright coverage for its user-facing journeys. Three decisions in the setup aren't obvious from the test code alone, and each one is costly to walk back once a suite is built on top of it.

## E2E owns wiring and journeys, not business rules

The hard logic already has vitest coverage: diff, apply, detection, orphan, present, hash on the tailoring side, and generate, preprocess, theme formatting on the export side. Re-checking those branches through a browser would produce slow, flaky duplicates of tests that already exist and run fast.

So the e2e suite stays at the level of "does the button call the right thing, does the URL change, does the seeded data show up, does the indicator appear, does the export download." Each rule gets one happy-path smoke through the real UI to prove it's wired in. The branch coverage stays in the unit tests that own it.

## Seeding splits by what's under test

State lives entirely in IndexedDB (Dexie); there is no server to load fixtures from. Two ways to get a CV into that state, picked per automated consumer by what it is actually checking.

Editor tests build their CV through the real UI, because the editor is the thing under test there. Dashboard, export, tailoring tests, and the asset-generation harness seed through `window.__devBridge`, a bridge that runs the production constructors (`createCV`, `createDummyCV`, `createTailoredCV`, the `db`). Building a populated nine-block master by typing, only to set up a sync test or a screenshot, would be slow and would tie every subsequent step to editor stability — a change to a field input would break setups that have nothing to do with editing.

The bridge runs production code rather than hand-rolled fixtures on purpose. A CV carries derived state — `blockHashes`, `syncBaseline`, `syncBaselineHashes` — that a raw fixture would have to reproduce and keep in step as the schema moves. Going through the real constructors keeps seeded data valid for free while the app is still changing shape.

`seedMaster` accepts an optional `MasterSeedContent` patch: plain JSON values (ISO date strings, arrays of text) for any of the nine blocks. The in-page implementation applies the patch on top of a `createDummyCV()` skeleton, mints `objectId`s for each new entry, and recomputes `blockHashes`. Passing no content gives the Jordan Rivera default; the asset harness passes Dwight Schrute content. Either way the CV is a fully valid, hash-consistent document produced by the real constructors.

The remaining primitives (`reset`, `seedTailored`, `patchMaster`) stay narrow. Composite setups — "a master with one tailored copy that has a pending update" — are assembled in Playwright helpers in the calling suite. No method is added until a consumer calls for one.

## The bridge is gated at build time, not by convention

`window.__devBridge` is attached only when `import.meta.env.VITE_DEV_BRIDGE` is set, so it is absent from both normal dev and normal production bundles. The e2e run builds and previews with `VITE_DEV_BRIDGE=true`. A build-time flag, rather than a `dev` check, lets the suite run against a real production preview build while still reaching the seed bridge — closer to what ships, and decoupled from the `dev`-gated Dev Toolbox, which is also extendable via `VITE_DEV_TOOLBOX`.

The cost is that a build deliberately made with the flag exposes a seam that writes to local IndexedDB. Since it only touches the user's own machine and never ships in a normal build, the exposure isn't worth guarding further.
