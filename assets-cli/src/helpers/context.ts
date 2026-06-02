import { mkdirSync } from 'fs';
import { dirname } from 'path';
import type { Browser, BrowserContext, Page } from 'playwright';
import { injectCursor, activateCursor } from './mouse';
import { getVideoDir } from './gif';
import { BASE_URL } from '../paths';

export { createRecorder } from './recorder';
export { zoomTo, zoomToPoint, resetZoom } from './zoom';
export { moveTo, moveCursor, hoverAndClick } from './mouse';

export type Theme = 'light' | 'dark';

// tsx transpiles this harness with esbuild's keepNames on, which rewrites a named
// inner function inside a page.evaluate body (e.g. the `clamp` helper in zoom.ts)
// as `__name(fn, 'clamp')`. That helper lives in the bundled module scope, not in
// the page, so the serialized function throws "__name is not defined" in the
// browser. The @playwright/test runner used to absorb this; driving the library
// directly, we define a no-op shim in every page instead.
const ESBUILD_NAME_SHIM = 'globalThis.__name = globalThis.__name || ((fn) => fn);';

async function injectNameShim(context: BrowserContext): Promise<void> {
	await context.addInitScript({ content: ESBUILD_NAME_SHIM });
}

export async function makePngContext(browser: Browser, theme: Theme): Promise<BrowserContext> {
	const context = await browser.newContext({
		colorScheme: theme,
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 2,
		baseURL: BASE_URL
	});
	await injectNameShim(context);
	return context;
}

export async function makeGifContext(browser: Browser, theme: Theme): Promise<BrowserContext> {
	const context = await browser.newContext({
		colorScheme: theme,
		viewport: { width: 1440, height: 900 },
		baseURL: BASE_URL,
		// 960×600 matches the 1440×900 viewport ratio (16:10) exactly
		recordVideo: {
			dir: getVideoDir(),
			size: { width: 960, height: 600 }
		},
		acceptDownloads: true
	});
	await injectNameShim(context);
	await injectCursor(context);
	return context;
}

export async function openPage(context: BrowserContext): Promise<Page> {
	return context.newPage();
}

export async function gotoHome(page: Page): Promise<void> {
	await page.goto('/', { waitUntil: 'networkidle' });
}

// Park the cursor at a neutral position after each navigation so it is visible
// before the first real interaction and subsequent moves start from a consistent spot.
export async function activateMouseHelper(page: Page): Promise<void> {
	await activateCursor(page);
}

export async function waitForPdfPreview(page: Page): Promise<void> {
	await page.waitForSelector('canvas', { timeout: 30_000 });
	// PDF renders with a 1s debounce then canvas painting — allow extra time
	await page.waitForTimeout(3000);
}

export async function captureScreenshot(page: Page, outputPath: string): Promise<void> {
	mkdirSync(dirname(outputPath), { recursive: true });
	await page.screenshot({ path: outputPath, animations: 'disabled' });
}
