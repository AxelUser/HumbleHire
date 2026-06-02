import { resolve } from 'path';
import type { BrowserContext, Locator, Page } from '@playwright/test';

const MOUSE_HELPER_PATH = resolve(process.cwd(), 'node_modules/mouse-helper/dist/mouse-helper.js');

export async function injectMouseHelper(context: BrowserContext): Promise<void> {
	await context.addInitScript({ path: MOUSE_HELPER_PATH });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function initMouseHelper(page: Page): Promise<void> {
	await page.evaluate(() => (window as any)['mouse-helper']?.());
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function moveTo(page: Page, locator: Locator, steps = 25): Promise<void> {
	const box = await locator.boundingBox();
	if (!box) return;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
}

export async function hoverAndClick(page: Page, locator: Locator): Promise<void> {
	await moveTo(page, locator);
	await page.waitForTimeout(400);
	await locator.click();
}
