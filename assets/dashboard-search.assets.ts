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

test('capture dashboard-search gif', async ({ browser }, testInfo) => {
	test.setTimeout(120_000);

	const theme = themeOf(testInfo);
	const context = await makeGifContext(browser, theme);
	const page = await openPage(context);

	try {
		await gotoHome(page);
		await activateMouseHelper(page);

		const b = await useBridge(page);
		await b.reset();

		const masterId = await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });
		await b.seedTailored(masterId, {
			name: 'Regional Manager — Dunder Mifflin',
			company: 'Dunder Mifflin Paper Company'
		});
		await b.seedTailored(masterId, {
			name: 'Innkeeper — Schrute Farms B&B',
			company: 'Schrute Farms'
		});
		await b.seedMaster({ name: 'Jim Halpert' });

		await page.reload({ waitUntil: 'networkidle' });
		await activateMouseHelper(page);
		await page.waitForSelector('[data-testid="master-group"]');

		// Brief pause to show the full dashboard
		await page.waitForTimeout(1200);

		// Move cursor to the search field and click it
		const searchField = page.getByPlaceholder('Search by name or company…');
		await hoverAndClick(page, searchField);
		await page.waitForTimeout(400);

		// Type "Dunder" slowly to filter by company
		await searchField.pressSequentially('Dunder', { delay: 120 });
		await page.waitForTimeout(1200);

		// Clear the search to restore the full list
		const clearBtn = page.getByRole('button', { name: 'Clear search' });
		await hoverAndClick(page, clearBtn);
		await page.waitForTimeout(800);
	} finally {
		const video = page.video()!;
		await context.close();
		const videoPath = await video.path();
		await videoToGif(videoPath, `docs/assets/dashboard-search.${theme}.gif`);
	}
});
