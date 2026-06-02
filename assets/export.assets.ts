import { test } from '@playwright/test';
import { useBridge } from './helpers/bridge';
import { dwightContent } from './helpers/dwight';
import {
	themeOf,
	makeGifContext,
	openPage,
	gotoHome,
	activateMouseHelper,
	createRecorder,
	hoverAndClick,
	zoomTo,
	resetZoom
} from './helpers/context';
import { videoToGif } from './helpers/gif';

test('capture export gif', async ({ browser }, testInfo) => {
	test.setTimeout(120_000);

	const theme = themeOf(testInfo);
	const context = await makeGifContext(browser, theme);
	const page = await openPage(context);
	const rec = createRecorder(page);

	try {
		// --- Setup (trimmed out of the GIF): seed a CV and load the dashboard ---
		await gotoHome(page);
		const b = await useBridge(page);
		await b.reset();
		await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });

		await page.reload({ waitUntil: 'networkidle' });
		await activateMouseHelper(page);
		await page.waitForSelector('[data-testid="master-group"]');

		// --- Recorded window starts here, on the loaded dashboard ---
		await rec.start({ holdMs: 1000 });

		// Push in on the card so the Export button is the clear focus.
		const exportBtn = page.getByRole('button', { name: 'Export' }).first();
		await zoomTo(page, exportBtn, { scale: 1.5, durationMs: 650 });
		await hoverAndClick(page, exportBtn);

		// Wait for the download to complete (PDF is generated in-browser).
		await page.waitForEvent('download', { timeout: 30_000 });
		await page.waitForTimeout(1000);
		await resetZoom(page);

		await rec.stop({ holdMs: 800 });
	} finally {
		const video = page.video()!;
		await context.close();
		const videoPath = await video.path();
		await videoToGif(videoPath, `docs/assets/export.${theme}.gif`, rec.window());
	}
});
