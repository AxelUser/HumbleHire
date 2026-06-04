# ADR-001: IndexedDB via Dexie for local storage

- **Status**: Accepted
- **Date**: 2026-03-15
- **Feature**: cv-editor

---

All CV data is persisted in the browser through IndexedDB, accessed only through Dexie.js (v4). HumbleHire is a local-first static SvelteKit app with no backend, so every CV must live in the user's own browser.

## Why IndexedDB

localStorage is synchronous, capped near 5 MB, and stores strings only. HumbleHire holds arbitrarily many CVs, each with many entries, so it would reach that cap and block the main thread on every write. IndexedDB is asynchronous, quota-based (browsers grant gigabytes to well-behaved origins), and stores structured objects directly.

OPFS and PGlite were considered and rejected. OPFS is a file-system API with no structured queries, so indexing CV records would mean rebuilding what IndexedDB already gives. PGlite runs Postgres in WASM and ships a multi-megabyte bundle for SQL joins and aggregations this app does not need.

## Why Dexie

Raw IndexedDB is callback-based and verbose. Dexie wraps it in a typed, promise-based API: `Table<CV>` gives typed operations, `liveQuery()` returns observables that fit Svelte's reactivity, schema versions are declared with `.version(n).stores()`, and multi-step writes run in one transaction. It adds about 23 kB gzipped.

## Schema

One store, keyed by `id`:

```
humblehire (IndexedDB database)
└── cvs   { id, updatedAt, sourceId }
```

`sourceId` is indexed because it is the only tailoring link: a tailored CV carries the `id` of the master it was copied from, and a master is any CV without one. There is no separate table for tailored CVs, and no version or snapshot store. A CV's sync baseline travels inside its own record. The full object shape is in `src/lib/types/cv.ts`; the Dexie schema string declares indexes only.

Schema changes go through Dexie's versioning API. Each `.version(n).stores()` call is additive and runs only when the stored version is lower; data transforms use an `.upgrade()` callback. This is the DB schema version (see `CONTEXT.md`), separate from the JSON schema that governs export files.

## Consequences

- CV data survives refresh, tab close, and browser restart, with effectively unlimited quota for normal use.
- Data is browser-local. Clearing site data deletes every CV, and nothing is shared across browsers or profiles. This is the local-first trade-off. Durability against automatic eviction is addressed in [ADR-005](./ADR-005-pwa-and-durable-storage.md); an off-device copy is a backup concern the app does not yet cover.
- There is no encryption; any script on the origin can read the data. This is acceptable because the app loads no third-party scripts.
