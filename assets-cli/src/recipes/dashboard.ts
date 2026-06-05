import { join } from 'node:path';
import { useBridge } from '@humblehire/dev-bridge';
import type { Recipe } from '../recipe';
import { dwightContent } from '../helpers/dwight';
import { makePngContext, openPage, gotoHome, captureScreenshot } from '../helpers/context';

export const dashboard: Recipe = {
	name: 'dashboard.png',
	async run(ctx) {
		const { theme, outDir } = ctx;
		const context = await makePngContext(ctx);
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

			await captureScreenshot(page, join(outDir, `dashboard.${theme}.png`));
		} finally {
			await context.close();
		}
	}
};
