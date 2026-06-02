/**
 * Decides how the service worker should answer a request. Kept free of the
 * service worker runtime so the whole policy can be tested with plain values:
 * `Request.mode` cannot be set to 'navigate' through the constructor, so the
 * three fields the decision actually needs are passed in directly.
 */

export type Route = 'asset' | 'navigate' | 'passthrough';

export interface RoutedRequest {
	method: string;
	url: string;
	mode: string;
}

/**
 * - `asset`: a precached build/static file — serve it cache-first.
 * - `navigate`: a page load for any other route — serve the cached app shell.
 * - `passthrough`: leave it to the network (non-GET, cross-origin, anything else).
 */
export function routeRequest(
	request: RoutedRequest,
	origin: string,
	assets: ReadonlySet<string>
): Route {
	if (request.method !== 'GET') return 'passthrough';

	const url = new URL(request.url);
	if (url.origin !== origin) return 'passthrough';

	if (assets.has(url.pathname)) return 'asset';
	if (request.mode === 'navigate') return 'navigate';

	return 'passthrough';
}
