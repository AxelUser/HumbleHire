# ADR-005: PWA with durable storage and offline-ready guarantee

- **Status**: Accepted
- **Date**: 2026-05-31

---

## Context

HumbleHire is a local-first SvelteKit app: all CV content lives in IndexedDB, there is no backend, and the output is a PDF generated entirely in the browser (per ADR-002). This architecture makes a Progressive Web App a natural fit — the hard part of most PWAs (offline API calls, server state, authentication) simply does not exist here.

Three problems converge into one decision:

1. **The app does not load offline.** A user on a plane gets a network error before seeing anything. Their CVs are in IndexedDB and perfectly accessible, but the app shell (HTML, JS, CSS) is not cached.

2. **IndexedDB is best-effort storage by default.** The browser is allowed to evict it without asking — under disk pressure in Chrome, or after seven days without a visit under Safari's Intelligent Tracking Prevention. For an app where users invest meaningful time composing CVs, silent data loss is the most damaging failure mode.

3. **The app is not installable.** Without a valid service worker and web app manifest, the browser's install affordance is never offered. Installation matters because it is the primary mechanism by which Chrome auto-grants persistent storage, and on iOS it exempts data from periodic clean-up.

SvelteKit has first-class, built-in support for service workers: `src/service-worker.ts` is automatically bundled and registered, and the `$service-worker` virtual module exposes `build` (every Vite-generated chunk), `files` (every file in `static/`), and `version` (a hash that changes on each deploy). These three arrays together contain everything needed for a complete offline cache without any additional tooling.

---

## Decision

Implement PWA support using **SvelteKit's native service worker** (`src/service-worker.ts`) with manual registration, covering these behaviors:

- **Precache `build` + `files`** at install time so editing, preview, and export all work offline after the first online visit. This automatically includes the pdfmake and pdf.js lazy chunks via `build`.
- **Self-host Space Grotesk** (woff2 files in `static/fonts/`) so the font is part of `files` and precached automatically, with no cross-origin caching complexity.
- **Prompt on new version** — the SW installs and waits rather than auto-activating; a toast lets the user choose when to reload; clicking Reload posts `SKIP_WAITING` to the waiting worker then reloads on `controllerchange`.
- **Request `navigator.storage.persist()` once, after the first CV save**, not on mount.
- **Show a custom install control** in the header that doubles as a data-durability nudge, with an iOS instruction sheet for platforms that have no `beforeinstallprompt`.
- **Hand-maintain the web app manifest** at `static/manifest.webmanifest`, with icons generated from the SVG source via `@vite-pwa/assets-generator` CLI.
- **Disable the service worker under `VITE_DEV_NO_SW`** to keep the Playwright suite from fighting a caching SW.

---

## Rationale

### Why SvelteKit's native service worker over a Vite plugin

SvelteKit gives you the hard part for free: the `$service-worker` module provides `build`, `files`, and `version` — the three arrays that together describe exactly what needs to be cached and when the cache is stale. The canonical SW logic (install → `cache.addAll`, activate → delete old caches, fetch → cache-first with offline fallback) fits in roughly 50 lines and covers all requirements here.

A Vite plugin adds Workbox, precache revisioning, runtime-caching recipes, and a virtual register module. Each of those features solves a real problem for apps that need it — dynamic API caching, partial URL precaching, complex cache strategies. None of those problems exist for HumbleHire. The app has no backend, no external API calls to cache, and no partial prerendering: every cached URL is either a fingerprinted Vite chunk or a static file. Workbox's revisioning solves stale-URL problems that hashed filenames already prevent.

Owning the service worker file directly means the caching logic is auditable in one place with no black-box code generation, the update flow is explicit (no virtual module machinery), and three dependencies (`vite-plugin-pwa`, `@vite-pwa/sveltekit`, `workbox-window`) are not needed. The `@vite-pwa/assets-generator` CLI is kept for icon generation because it has no alternative at that specific job.

### Why precache everything, including the PDF engine

The pdfmake (~1 MB) and pdf.js (~1.2 MB worker) chunks are lazy-loaded per ADR-002. Precaching does not change when they execute; it changes where the browser fetches them from on first use. Without precaching, a user who has never exported or opened the preview while online will find those features fail offline. Since export is the primary output and offline is an explicit goal, including them in `build` — which happens automatically — is the correct path of least resistance.

### Why self-host Space Grotesk

A hand-rolled service worker can cache cross-origin opaque responses, but it cannot validate them (no status code, no headers), cannot set appropriate cache expiry, and cannot detect failures — the cache grows blind. Self-hosting removes the complexity entirely: woff2 files land in `static/fonts/` and flow through `files` into the precache exactly like any other static asset, available offline on first visit with no special-casing in the SW.

This is consistent with the `CONTEXT.md` definition of local-first: stopping the per-visit request to the Google Fonts CDN is an improvement, not a requirement. The existing "Local-first" glossary entry already lists web fonts as a _legitimate_ non-content request; removing them simply reduces the app's external footprint.

### Why the manual waiting-worker flow over `updated` + auto-`skipWaiting`

The editor auto-saves on every keystroke. A SW that calls `skipWaiting()` immediately on install activates as soon as the install completes, including while the user is mid-edit. If that tab then lazy-loads a chunk (for example, the first PDF export after a deploy), it may request a URL that exists in the new SW's cache but not the old one, causing a silent failure.

The manual waiting-worker flow keeps the old SW serving until the user chooses to reload. The SW installs and waits; the layout detects `registration.waiting`, shows a persistent toast ("A new version of HumbleHire is available"), and only posts `SKIP_WAITING` when the user clicks Reload. The reload is then triggered on the `controllerchange` event, which fires exactly once the new worker takes over. No unexpected swaps, no mid-edit disruptions.

This is more code than a single `skipWaiting()` call, but the 25-odd lines are straightforward and entirely owned.

### Why register manually rather than using the automatic default

SvelteKit's automatic registration happens inside the framework at an unspecified point in the page lifecycle. Manual registration (on `onMount` in the root layout) gives precise control over when registration runs, makes the `VITE_DEV_NO_SW` guard trivial (just skip the call), and puts the registration and the update-detection logic in the same place for easier reading.

### Why request `persist()` after the first CV save

Browser heuristics for granting the persistent-storage request depend on engagement signals. Requesting at page load — before the user has done anything — is the lowest-engagement moment. Waiting until after the first CV save means the user has invested real work and the browser has a stronger signal to grant. On Firefox, which shows a native permission prompt, this timing makes the prompt comprehensible. The request is guarded by a `persisted()` check so it fires at most once.

Installing the PWA reinforces the grant: on Chrome it is the strongest heuristic signal and often auto-grants persistent storage; on iOS, a Home Screen app is exempt from the seven-day ITP eviction timer. The install control and the durability nudge therefore share a single header surface.

### What this does not guarantee

Persistent storage resists automatic browser eviction. It does not survive the user explicitly clearing site data, switching to a different browser or profile, or storage corruption. The only copy that survives those scenarios is an off-device backup. This ADR does not introduce a backup/restore feature. The term "Backup" is defined in `CONTEXT.md` as a distinct concept from "Export" to reserve the vocabulary for a future decision.

---

## Consequences

### Positive

- The app loads and is fully functional — edit, preview, export — with no network after the first online visit.
- Space Grotesk renders correctly offline on first visit with no cross-origin caching complexity.
- Users can install HumbleHire as a standalone app on all major platforms.
- Persistent storage is requested at the highest-engagement moment; installing reinforces the grant.
- The install control makes the data-durability story legible to the user in one place.
- The new-version prompt prevents silent mid-edit reloads.
- The e2e test suite is unaffected by the service worker (`VITE_DEV_NO_SW` guard skips registration).
- The SW file is a plain TypeScript file with no generated code, fully auditable and debuggable.

### Negative / Trade-offs

- The service worker must be tested against a production build (`vite build && vite preview`); it is not active during `vite dev`.
- Committing woff2 font files adds binary assets to the repository (~150–200 KB for Space Grotesk variable font subsets).
- The manual update flow (~25 lines in the layout) is more code than relying on a plugin's virtual register module, and must be kept consistent with the SW's message protocol.
- A misbehaving service worker is harder to recover from than a broken page: it can serve stale content to every user. Careful smoke-testing before each deploy matters.
- Persistent storage is not a backup. Users who clear site data or switch browsers lose their CVs.

---

## References

- [SvelteKit service workers](https://svelte.dev/docs/kit/service-workers)
- [$service-worker module](https://svelte.dev/docs/kit/$service-worker)
- [@vite-pwa/assets-generator CLI](https://vite-pwa-org.netlify.app/assets-generator/cli.html)
- [Storage API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API)
- [Service Worker Lifecycle — web.dev](https://web.dev/articles/service-worker-lifecycle)
- [ADR-001](./ADR-001-indexeddb-dexie.md) — IndexedDB via Dexie
- [ADR-002](./ADR-002-client-side-pdf-generation.md) — client-side PDF generation (lazy-loaded chunks)
