import type { ElementHandle, Locator, Page } from '@playwright/test';

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
// Re-centring (zooming from an already-zoomed state to a new target) glides from
// where the camera was. To make that smooth we measure the target in the
// *untransformed* layout — but inside the same evaluate that re-applies the
// transform, so the page is never painted unzoomed and there is no flash. The
// target is measured via its live element so the centring maths matches what the
// element's real layout position is, not where the current zoom happens to put it.
//
// The cursor lives on <html> (see mouse.ts), so it stays sharp and correctly
// positioned while <body> scales underneath it, and Playwright still clicks the
// real, post-transform element boxes.

export interface ZoomOptions {
	// How far to scale in. 1 = no zoom; ~1.5–2.2 reads well for most actions.
	scale?: number;
	// Duration of the glide. Longer feels more cinematic, shorter snappier.
	durationMs?: number;
	easing?: string;
}

const DEFAULT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

// Drive the body transform so `target` (a live element) or `point` (an absolute
// viewport coordinate, used when there is no element) ends up centred. Pass at
// most one of them.
async function applyZoom(
	page: Page,
	target: ElementHandle<Element> | null,
	point: { x: number; y: number } | null,
	{ scale = 1.6, durationMs = 650, easing = DEFAULT_EASING }: ZoomOptions
): Promise<void> {
	await page.evaluate(
		({ el, px, py, scale, durationMs, easing }) => {
			const body = document.body;
			// Snapshot the current transform so we can resume the animation from it.
			const prev = getComputedStyle(body).transform;
			// Drop to the untransformed layout to measure — no await between here and
			// re-applying the transform below, so this state is never painted.
			body.style.transition = 'none';
			body.style.transform = 'none';
			body.style.transformOrigin = '0 0';
			const rect = body.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;

			let vx: number;
			let vy: number;
			if (el) {
				const r = (el as HTMLElement).getBoundingClientRect();
				vx = r.left + r.width / 2;
				vy = r.top + r.height / 2;
			} else {
				vx = px;
				vy = py;
			}

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
		{ el: target, px: point?.x ?? 0, py: point?.y ?? 0, scale, durationMs, easing }
	);
	await page.waitForTimeout(durationMs);
}

// Zoom in centred on a located element. Safe to call while already zoomed — it
// re-centres smoothly on the element's true layout position.
export async function zoomTo(page: Page, locator: Locator, opts: ZoomOptions = {}): Promise<void> {
	await locator.scrollIntoViewIfNeeded();
	const handle = await locator.elementHandle();
	if (!handle) return;
	try {
		await applyZoom(page, handle, null, opts);
	} finally {
		await handle.dispose();
	}
}

// Zoom in centred on an absolute viewport point.
export async function zoomToPoint(
	page: Page,
	x: number,
	y: number,
	opts: ZoomOptions = {}
): Promise<void> {
	await applyZoom(page, null, { x, y }, opts);
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
