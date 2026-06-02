import { test } from '@playwright/test';
import { useBridge } from './helpers/bridge';
import { dwightContent } from './helpers/dwight';
import {
	themeOf,
	makeGifContext,
	openPage,
	gotoHome,
	activateMouseHelper
} from './helpers/context';
import { videoToGif } from './helpers/gif';
import { hoverAndClick } from './helpers/mouse';

test('capture export gif', async ({ browser }, testInfo) => {
	test.setTimeout(120_000);

	const theme = themeOf(testInfo);
	const context = await makeGifContext(browser, theme);
	const page = await openPage(context);

	try {
		await gotoHome(page);
		await activateMouseHelper(page);

		const b = await useBridge(page);
		await b.reset();
		await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });

		await page.reload({ waitUntil: 'networkidle' });
		await activateMouseHelper(page);
		await page.waitForSelector('[data-testid="master-group"]');
		await page.waitForTimeout(1000);

		// Move to the Export button on the dashboard card
		const exportBtn = page.getByRole('button', { name: 'Export' }).first();
		await hoverAndClick(page, exportBtn);

		// Wait for the download to complete (PDF is generated in-browser)
		await page.waitForEvent('download', { timeout: 30_000 });
		await page.waitForTimeout(1200);
	} finally {
		const video = page.video()!;
		await context.close();
		const videoPath = await video.path();
		await videoToGif(videoPath, `docs/assets/export.${theme}.gif`);
	}
});
