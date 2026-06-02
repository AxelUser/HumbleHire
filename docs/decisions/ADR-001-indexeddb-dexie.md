# ADR-001: Use IndexedDB via Dexie.js for local storage

- **Status**: Accepted
- **Date**: 2026-03-15
- **Feature**: cv-editor

---

## Context

HumbleHire is a local-first, static SvelteKit application — there is no backend, no server, and no cloud sync. All CV data must be persisted entirely in the browser.

The data we need to persist:

- Multiple `CV` documents, each containing structured block content.
- `CVVersion` snapshots — append-only named checkpoints of a CV's blocks at a point in time.
- Eventually: tailored CV metadata and diffs (future feature).

This rules out any server-side or cloud storage option by design.

### Browser storage options considered

| Option                     | Max Storage       | Structured Queries | Transactions | TypeScript Support | Notes                                     |
| -------------------------- | ----------------- | ------------------ | ------------ | ------------------ | ----------------------------------------- |
| `localStorage`             | ~5 MB             | No                 | No           | Manual             | Synchronous, string-only. Too limited.    |
| `sessionStorage`           | ~5 MB             | No                 | No           | Manual             | Lost on tab close. Not suitable.          |
| `IndexedDB` (raw)          | Quota-based (GBs) | Yes                | Yes          | Poor               | Callback-based async API is very verbose. |
| **IndexedDB via Dexie.js** | Quota-based (GBs) | Yes                | Yes          | Excellent          | Promise-based, typed, declarative schema. |

---

## Decision

Use **IndexedDB** as the persistence backend, accessed exclusively through **[Dexie.js](https://dexie.org/)** (v4).

---

## Rationale

### Why IndexedDB over localStorage

`localStorage` is synchronous and limited to ~5 MB of string data. HumbleHire will store arbitrarily many CVs, each potentially containing many job history entries and version snapshots.
`localStorage` would require manual JSON serialization, lacks transactions, and would silently break once the storage cap is hit.

IndexedDB is quota-based (browsers allocate gigabytes for well-behaved origins), supports structured JavaScript objects natively, and is fully asynchronous - it does not block the main thread.

### Why Dexie.js over raw IndexedDB

The raw IndexedDB API is callback-based, verbose, and error-prone. A typical `put` operation requires opening a transaction, getting an object store, calling `put`, attaching `onsuccess`/`onerror` handlers, and managing the transaction lifecycle manually.

Dexie wraps all of this in a clean Promise-based API with:

- **Declarative schema versioning** via `.version(n).stores({...})`: migrations are trivial.
- **Full TypeScript generics**: `Table<CV>` gives typed `.add()`, `.put()`, `.get()`, `.where()`, etc.
- **Live queries** via `liveQuery()`: returns an observable that re-fires when the underlying data changes, which integrates naturally with Svelte's reactivity.
- **Compact bundle**: Dexie v4 is ~23 kB gzipped, acceptable for a local tool.
- **Transactions**: multi-table operations (e.g. deleting a CV and all its versions) are wrapped in a single atomic transaction.

### Why not OPFS or PGlite

OPFS is a lower-level file-system API suited for binary data or large file blobs. It lacks native structured querying; building an index over CV records would require re-implementing what IndexedDB already provides.

PGlite runs Postgres in WASM, which is genuinely impressive, but its bundle size (~3–7 MB gzipped depending on features) is too large for a structured document store with a simple schema. SQL joins and aggregations are not a requirement for this application.

---

## Schema

```
humblehire (IndexedDB database)
├── cvs        { id, updatedAt }         ← primary key: id
└── versions   { id, cvId, createdAt }   ← primary key: id; index: cvId
```

Dexie schema strings define indexes, not the full object shape. The full TypeScript shape is in `src/lib/types/cv.ts`.

---

## Migration strategy

Dexie handles schema migrations through its versioning API:

```ts
this.version(1).stores({ cvs: 'id, updatedAt', versions: 'id, cvId, createdAt' });

// Future: add a 'tailoredCvs' table
this.version(2).stores({ cvs: 'id, updatedAt', versions: '...', tailoredCvs: 'id, cvId' });
```

Each `version()` call is additive; Dexie runs the upgrade only if the user's stored schema version is lower. Data migrations (transforming existing records) are done via an `.upgrade()` callback on the relevant version block.

---

## Consequences

### Positive

- All CV data survives page refresh, tab close, and browser restart.
- Quota is effectively unlimited for typical usage.
- Dexie's `liveQuery` enables reactive UI updates without polling.
- Schema migrations are explicit, versioned, and forward-only — safe to evolve.

### Negative / Trade-offs

- Data is browser-local: if the user clears site data, all CVs are lost. This is an intentional product constraint (local-first, no cloud sync), but should be surfaced clearly in the UI (e.g. an export/backup prompt).
- IndexedDB data is not accessible across different browsers or profiles on the same machine.
- There is no built-in encryption; CVs are readable by any script running on the same origin (acceptable: no third-party scripts, local app only).

---

## References

- [Dexie.js documentation](https://dexie.org/docs/)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Storage for the web — web.dev](https://web.dev/articles/storage-for-the-web)
