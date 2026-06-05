# ADR-004: E2E covers wiring and journeys, seeded through a dev bridge

- **Status**: Accepted
- **Date**: 2026-05-30
- **Feature**: testing

---

Playwright covers the user-facing journeys. Three choices in the setup are not obvious from the test code, and each is costly to walk back once a suite sits on top of it.

## E2E owns wiring, not business rules

The hard logic already has vitest coverage: diff, apply, detection, orphan, present, and hash on the tailoring side; generate, preprocess, and theme formatting on the export side. Re-checking those branches through a browser would produce slow, flaky duplicates of fast tests that already exist.

So the e2e suite stays at the level of wiring: does the button call the right thing, does the URL change, does seeded data show up, does the indicator appear, does the export download. Each rule gets one happy-path smoke through the real UI to prove it is wired in. Branch coverage stays in the unit tests that own it.

## Seeding splits by what is under test

State lives entirely in IndexedDB; there is no server to load fixtures from. There are two ways to get a CV into that state, picked per test by what it is checking.

Editor tests build their CV through the real UI, because the editor is the thing under test. Dashboard, export, and tailoring tests, plus the asset-generation harness, seed through `window.__devBridge`, which runs the production constructors (`createCV`, `createDummyCV`, `createTailoredCV`, and `db`). Building a populated nine-block master by typing, only to set up a sync test or a screenshot, would be slow and would tie every later step to editor stability.

The bridge runs production code rather than hand-rolled fixtures on purpose. A CV carries derived state (`blockHashes`, `syncBaseline`, `syncBaselineHashes`) that a raw fixture would have to reproduce and keep in step as the schema moves. Going through the real constructors keeps seeded data valid for free while the app is still changing shape.

`seedMaster` takes an optional `MasterSeedContent` patch of plain JSON values for any of the nine blocks. It applies the patch on a `createDummyCV()` skeleton, mints `objectId`s for new entries, and recomputes `blockHashes`. No content gives the Jordan Rivera default; the asset harness passes Dwight Schrute content. Either way the result is a valid, hash-consistent CV from the real constructors. The remaining primitives (`reset`, `seedTailored`, `patchMaster`) stay narrow, and composite setups are assembled in Playwright helpers in the calling suite. No method is added until a consumer needs it.

## The bridge is gated at build time

`window.__devBridge` is attached only when `VITE_DEV_BRIDGE` is set, so it is absent from normal dev and normal production bundles. The e2e run builds and previews with `VITE_DEV_BRIDGE=true`. A build-time flag, rather than a `dev` check, lets the suite run against a real production preview build while still reaching the seed bridge: closer to what ships, and decoupled from the `dev`-gated Dev Toolbox, which has its own `VITE_DEV_TOOLBOX` flag.

The cost is that a build made with the flag exposes a seam that writes to local IndexedDB. Since it only touches the user's own machine and never ships in a normal build, the exposure is not worth guarding further.
