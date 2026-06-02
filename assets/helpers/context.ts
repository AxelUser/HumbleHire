import { mkdirSync } from 'fs';
import type { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { injectCursor, activateCursor } from './mouse';
import { getVideoDir } from './gif';

const BASE_URL = 'http://localhost:4888';

export type Theme = 'light' | 'dark';

export function themeOf(testInfo: TestInfo): Theme {
	return testInfo.project.name as Theme;
}

export async function makePngContext(browser: Browser, theme: Theme): Promise<BrowserContext> {
	return browser.newContext({
		colorScheme: theme,
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 2,
		baseURL: BASE_URL
	});
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
	mkdirSync('docs/assets', { recursive: true });
	await page.screenshot({ path: outputPath, animations: 'disabled' });
}
