/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';
import { routeRequest } from './lib/pwa/sw-router';

declare const self: ServiceWorkerGlobalScope;

const CACHE = `app-${version}`;

// '/' must be cached explicitly — adapter-static's index.html isn't in build or files
const ASSETS = ['/', ...build, ...files];
const ASSET_PATHS = new Set(ASSETS);

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== CACHE) await caches.delete(key);
			}
			await self.clients.claim();
		})
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

self.addEventListener('fetch', (event) => {
	const route = routeRequest(event.request, self.location.origin, ASSET_PATHS);
	if (route === 'passthrough') return;

	event.respondWith(serve(event.request, route));
});

async function serve(request: Request, route: 'asset' | 'navigate'): Promise<Response> {
	const cache = await caches.open(CACHE);

	// A precached build/static file. After a successful install it's always here;
	// the network fetch is only a guard against an interrupted install.
	if (route === 'asset') {
		const cached = await cache.match(request);
		return cached ?? fetch(request);
	}

	// A page load for any other route: hand back the cached app shell so deep
	// links and refreshes work offline. The shell only changes when a new build's
	// service worker activates, which is what the reload prompt is for.
	const shell = await cache.match('/');
	return shell ?? fetch(request);
}
