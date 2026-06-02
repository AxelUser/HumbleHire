import type { Locator, Page } from '@playwright/test';

// Cinematic, lossless zoom for the captures. We scale <body> with a CSS
// transform and slide the point of interest to the centre of the viewport,
// animated so the camera glides in before a key action. Because the page is
// rendered at full resolution and only the recording downscales afterwards,
// zooming here keeps detail that a post-encode crop of the GIF would throw away.
//
// The camera *centres* the target rather than pinning it in place: a plain
// transform-origin zoom keeps the anchor stationary, which shoves everything to
// its left and below off-screen when the anchor sits near an edge (e.g. a field
// in the left editor column). Centring + clamping keeps the whole region framed
// with room around it and never reveals blank space past the page edges.
//
// The cursor lives on <html> (see mouse.ts), so it stays sharp and correctly
// positioned while <body> scales underneath it, and Playwright still clicks the
// real, post-transform element boxes.
//
// zoomTo/zoomToPoint measure the target in the untransformed layout, so call
// them from an unzoomed state (the start of a capture, or after resetZoom).

export interface ZoomOptions {
	// How far to scale in. 1 = no zoom; ~1.5–2.2 reads well for most actions.
	scale?: number;
	// Duration of the glide. Longer feels more cinematic, shorter snappier.
	durationMs?: number;
	easing?: string;
}

const DEFAULT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

async function applyZoom(
	page: Page,
	viewportX: number,
	viewportY: number,
	{ scale = 1.6, durationMs = 650, easing = DEFAULT_EASING }: ZoomOptions
): Promise<void> {
	await page.evaluate(
		({ vx, vy, scale, durationMs, easing }) => {
			const body = document.body;
			// Remember the current (possibly already-zoomed) transform so the
			// animation can start from it — we only drop it to measure the real,
			// untransformed layout, then restore it before transitioning.
			const prev = getComputedStyle(body).transform;
			body.style.transition = 'none';
			body.style.transform = 'none';
			body.style.transformOrigin = '0 0';
			const rect = body.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;

			// With origin 0 0, a body-local point p renders at rect.origin + tx + p*scale.
			// Solve tx/ty so the point of interest lands at the viewport centre.
			let tx = vw / 2 - rect.left - scale * (vx - rect.left);
			let ty = vh / 2 - rect.top - scale * (vy - rect.top);

			// Clamp so the scaled body still covers the viewport — keeps the framing
			// from sliding past the page edges and exposing blank gutters. If an axis
			// is somehow smaller than the viewport, centre it instead.
			const clamp = (value: number, origin: number, viewport: number, size: number): number => {
				const lower = viewport - origin - scale * size; // right/bottom edge flush
				const upper = -origin; // left/top edge flush
				if (lower > upper) return (viewport - scale * size) / 2 - origin;
				return Math.min(upper, Math.max(lower, value));
			};
			tx = clamp(tx, rect.left, vw, rect.width);
			ty = clamp(ty, rect.top, vh, rect.height);

			// Restore the prior transform instantly, then transition to the new one —
			// this glides (pans) from wherever the camera was, with no flash back to
			// the unzoomed state on a re-centre.
			body.style.transform = prev && prev !== 'none' ? prev : 'none';
			void body.offsetWidth;
			body.style.transition = `transform ${durationMs}ms ${easing}`;
			body.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
		},
		{ vx: viewportX, vy: viewportY, scale, durationMs, easing }
	);
	await page.waitForTimeout(durationMs);
}

// Zoom in centred on a located element.
export async function zoomTo(page: Page, locator: Locator, opts: ZoomOptions = {}): Promise<void> {
	await locator.scrollIntoViewIfNeeded();
	const box = await locator.boundingBox();
	if (!box) return;
	await applyZoom(page, box.x + box.width / 2, box.y + box.height / 2, opts);
}

// Zoom in centred on an absolute viewport point.
export async function zoomToPoint(
	page: Page,
	x: number,
	y: number,
	opts: ZoomOptions = {}
): Promise<void> {
	await applyZoom(page, x, y, opts);
}

// Glide back to the unzoomed view.
export async function resetZoom(
	page: Page,
	{ durationMs = 550, easing = DEFAULT_EASING }: Omit<ZoomOptions, 'scale'> = {}
): Promise<void> {
	await page.evaluate(
		({ durationMs, easing }) => {
			const body = document.body;
			body.style.transition = `transform ${durationMs}ms ${easing}`;
			body.style.transform = 'none';
		},
		{ durationMs, easing }
	);
	await page.waitForTimeout(durationMs);
}
