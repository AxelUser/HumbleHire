import type { Page } from '@playwright/test';
import type { HhTestBridge } from '$lib/e2e-bridge';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function useBridge(page: Page): Promise<HhTestBridge> {
	await page.waitForFunction(() => !!(window as any).__hhTest, { timeout: 5000 });
	return {
		reset: () => page.evaluate(() => (window as any).__hhTest.reset()),
		seedMaster: (o) => page.evaluate((o) => (window as any).__hhTest.seedMaster(o), o),
		seedTailored: (id, o) =>
			page.evaluate(({ id, o }) => (window as any).__hhTest.seedTailored(id, o), { id, o }),
		patchMaster: (id, p) =>
			page.evaluate(({ id, p }) => (window as any).__hhTest.patchMaster(id, p), { id, p }),
		seedOrphanedTailored: (o) =>
			page.evaluate((o) => (window as any).__hhTest.seedOrphanedTailored(o), o),
		getCv: (id) => page.evaluate((id) => (window as any).__hhTest.getCv(id), id)
	};
}
/* eslint-enable @typescript-eslint/no-explicit-any */
