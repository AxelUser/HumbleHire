import { test } from '@playwright/test';
import { useBridge } from './helpers/bridge';
import { dwightContent } from './helpers/dwight';
import { themeOf, makePngContext, openPage, gotoHome, captureScreenshot } from './helpers/context';

test('capture dashboard png', async ({ browser }, testInfo) => {
	const theme = themeOf(testInfo);
	const context = await makePngContext(browser, theme);
	const page = await openPage(context);

	try {
		await gotoHome(page);
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

		// Also add a second master to show a multi-group dashboard
		await b.seedMaster({ name: 'Jim Halpert' });

		await page.reload({ waitUntil: 'networkidle' });
		// Wait for the card groups to render
		await page.waitForSelector('[data-testid="master-group"]');

		await captureScreenshot(page, `docs/assets/dashboard.${theme}.png`);
	} finally {
		await context.close();
	}
});
