# ADR-005: PWA with durable storage and an offline-ready guarantee

- **Status**: Accepted
- **Date**: 2026-05-31
- **Feature**: pwa

---

HumbleHire is a PWA built on SvelteKit's native service worker (`src/service-worker.ts`), with no Vite PWA plugin. The worker precaches the app shell and the PDF engine, fonts are self-hosted, a new version waits for the user before activating, and persistent storage is requested after the first CV save. Together these make the app load offline and make local storage durable.

## Context

Three problems converge into one decision. The app does not load offline, because the shell (HTML, JS, CSS) is not cached, even though the CVs in IndexedDB are accessible. IndexedDB is best-effort storage that the browser may evict without asking, under disk pressure on Chrome or after seven days without a visit under Safari's ITP. And the app is not installable without a service worker and manifest, which matters because installing is the main way Chrome auto-grants persistent storage, and on iOS it exempts data from periodic clean-up.

SvelteKit's `$service-worker` module gives `build` (every Vite chunk), `files` (everything in `static/`), and `version` (a per-deploy hash). Those three arrays describe exactly what to cache and when the cache is stale.

## Why a native service worker over a Vite plugin

The canonical service-worker logic (install caches `build` + `files`, activate deletes old caches, fetch is cache-first with an offline fallback) fits in about 50 lines and covers every requirement here. A Vite plugin adds Workbox, precache revisioning, and runtime-caching recipes, which solve problems this app does not have: no backend, no external API to cache, no partial prerendering. Every cached URL is a fingerprinted chunk or a static file, so Workbox's revisioning solves stale-URL problems that hashed filenames already prevent. Owning the file keeps the caching logic auditable in one place and drops three dependencies. The `@vite-pwa/assets-generator` CLI is kept only for icon generation, which has no good alternative.

## Why precache the PDF engine

pdfmake and the PDF.js worker are lazy-loaded ([ADR-002](./ADR-002-client-side-pdf-generation.md), [ADR-007](./ADR-007-pdf-js-preview.md)). Precaching does not change when they run, only where the browser fetches them on first use. Both arrive through `build` automatically, so a user who has never exported or opened the preview while online can still do both offline. Since export is the primary output and offline is a stated goal, including them is the natural choice.

## Why self-host Space Grotesk

A hand-rolled service worker can cache a cross-origin font response but cannot validate it (no status, no headers) or set sensible expiry. Self-hosting removes that: the woff2 files sit in `static/fonts/` and flow through `files` into the precache like any other static asset, available offline on first visit. This matches the local-first definition in `CONTEXT.md`, where web fonts are a legitimate non-content request; self-hosting simply removes one external call.

## Why a new version waits for the user

The editor auto-saves on every keystroke. A service worker that calls `skipWaiting()` on install activates mid-edit. If that tab then lazy-loads a chunk (say, the first export after a deploy), it may request a URL that exists in the new worker's cache but not the old one, and fail silently.

So the worker installs and waits. The layout detects `registration.waiting` and shows a persistent prompt ("A new version of HumbleHire is available"). Only when the user clicks Reload does it post `SKIP_WAITING` to the waiting worker, and the reload fires on `controllerchange`, once the new worker takes over. The prompt avoids the word "update", which `CONTEXT.md` reserves for sync. This is about 25 lines over a single `skipWaiting()` call, and it prevents mid-edit swaps.

Registration is manual, in `onMount` in the root layout, which puts registration and update-detection in one place and makes the dev guard trivial.

## Why request persistent storage after the first save

Whether the browser grants `navigator.storage.persist()` depends on engagement signals, and page load, before the user has done anything, is the weakest signal. After the first CV save the user has invested real work, so the browser is more likely to grant it, and on Firefox the native prompt makes sense at that moment. The request is guarded by a `persisted()` check and fires at most once. Installing the app reinforces the grant: on Chrome it often auto-grants, and on iOS a Home Screen app is exempt from the seven-day ITP timer. The install control and the durability nudge share one header surface.

## What this does not guarantee

Persistent storage resists automatic eviction. It does not survive the user clearing site data, switching browser or profile, or storage corruption. The only copy that survives those is an off-device backup, which this ADR does not add. "Backup" is kept distinct from "Export" in `CONTEXT.md` to reserve the term for a later decision.

## Consequences

- The app loads and fully works offline (edit, preview, export) after the first online visit.
- The service worker must be tested against a production build (`vite build && vite preview`); it is not active in `vite dev`. The e2e suite disables it with `VITE_DEV_NO_SW`.
- Committing woff2 subsets adds ~150–200 KB of binary assets to the repo.
- The manifest is hand-maintained at `static/manifest.webmanifest`, with icons generated from the SVG source.
- A misbehaving service worker can serve stale content to every user, so each deploy needs a smoke test.

## References

- [ADR-001](./ADR-001-indexeddb-dexie.md) — IndexedDB via Dexie
- [ADR-002](./ADR-002-client-side-pdf-generation.md) — build PDFs with pdfmake
- [ADR-007](./ADR-007-pdf-js-preview.md) — PDF.js preview
