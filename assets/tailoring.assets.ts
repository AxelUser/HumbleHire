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
	hoverAndClick
} from './helpers/context';
import { videoToGif } from './helpers/gif';

test('capture tailoring gif', async ({ browser }, testInfo) => {
	test.setTimeout(120_000);

	const theme = themeOf(testInfo);
	const context = await makeGifContext(browser, theme);
	const page = await openPage(context);
	const rec = createRecorder(page);

	try {
		// --- Setup (trimmed out of the GIF): seed a master + tailored copy, then
		// patch the master so two diff items exist for the sync demo:
		//   - position: Dwight refuses "TO THE"
		//   - location: accept the farm address
		await gotoHome(page);
		const b = await useBridge(page);
		await b.reset();

		const masterId = await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });
		const tailoredId = await b.seedTailored(masterId, {
			name: 'Regional Manager — Dunder Mifflin',
			company: 'Dunder Mifflin Paper Company'
		});
		await b.patchMaster(masterId, {
			position: 'Assistant TO THE Regional Manager',
			location: 'Scranton, PA — Schrute Farms'
		});

		// Reload to show the dashboard with the sync indicator.
		await page.reload({ waitUntil: 'networkidle' });
		await activateMouseHelper(page);
		await page.waitForSelector('[data-testid="sync-indicator"]');

		// --- Recorded window starts here, on the dashboard with the sync hint ---
		await rec.start({ holdMs: 1500 });

		// Navigate into the tailored CV editor.
		await page.goto(`/cv/${tailoredId}`, { waitUntil: 'networkidle' });
		await activateMouseHelper(page);

		// Wait for the Review · Sync button (requires the master CV to load).
		const reviewBtn = page.getByRole('button', { name: /Review/ });
		await reviewBtn.waitFor({ state: 'visible', timeout: 15_000 });
		await page.waitForTimeout(800);

		// Open the sync drawer.
		await hoverAndClick(page, reviewBtn);

		// Wait for the sync panel with 2 changes.
		await page.waitForSelector(':text("2 changes")');
		await page.waitForTimeout(800);

		// Dismiss the title change (Dwight would never accept "TO THE").
		const dismissBtn = page.getByRole('button', { name: 'Dismiss change' }).first();
		await hoverAndClick(page, dismissBtn);
		await page.waitForTimeout(600);

		// Accept the location change.
		const acceptBtn = page.getByRole('button', { name: 'Accept change' }).first();
		await hoverAndClick(page, acceptBtn);
		await page.waitForTimeout(600);

		// Apply — now enabled since all items are decided.
		const applyBtn = page.getByRole('button', { name: 'Apply changes' });
		await hoverAndClick(page, applyBtn);

		await rec.stop({ holdMs: 1000 });
	} finally {
		const video = page.video()!;
		await context.close();
		const videoPath = await video.path();
		await videoToGif(videoPath, `docs/assets/tailoring.${theme}.gif`, rec.window());
	}
});
