import { describe, expect, it } from 'vitest';
import { routeRequest } from './sw-router';

const ORIGIN = 'https://humblehire.app';
const ASSETS = new Set(['/', '/_app/immutable/entry/start.js', '/favicon/favicon.svg']);

function req(overrides: Partial<{ method: string; url: string; mode: string }> = {}) {
	return { method: 'GET', url: `${ORIGIN}/`, mode: 'navigate', ...overrides };
}

describe('routeRequest', () => {
	it('sends non-GET requests straight to the network', () => {
		const route = routeRequest(
			req({ method: 'POST', url: `${ORIGIN}/_app/immutable/entry/start.js`, mode: 'cors' }),
			ORIGIN,
			ASSETS
		);
		expect(route).toBe('passthrough');
	});

	it('leaves cross-origin requests to the browser', () => {
		const route = routeRequest(
			req({ url: 'https://us.posthog.com/e/', mode: 'cors' }),
			ORIGIN,
			ASSETS
		);
		expect(route).toBe('passthrough');
	});

	it('serves a precached build asset from cache', () => {
		const route = routeRequest(
			req({ url: `${ORIGIN}/_app/immutable/entry/start.js`, mode: 'cors' }),
			ORIGIN,
			ASSETS
		);
		expect(route).toBe('asset');
	});

	it('falls back to the app shell for a navigation to an unknown route', () => {
		const route = routeRequest(
			req({ url: `${ORIGIN}/editor/abc123`, mode: 'navigate' }),
			ORIGIN,
			ASSETS
		);
		expect(route).toBe('navigate');
	});

	it('treats the root path as a precached asset', () => {
		const route = routeRequest(req({ url: `${ORIGIN}/`, mode: 'navigate' }), ORIGIN, ASSETS);
		expect(route).toBe('asset');
	});

	it('does not cache an unknown same-origin GET', () => {
		const route = routeRequest(
			req({ url: `${ORIGIN}/some/api/call`, mode: 'cors' }),
			ORIGIN,
			ASSETS
		);
		expect(route).toBe('passthrough');
	});
});
