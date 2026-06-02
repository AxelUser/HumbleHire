import { test, expect } from '@playwright/test';
import { useBridge } from './helpers/bridge';
import { gotoHome } from './helpers/ui';

test.describe('Export', () => {
	test('downloading from a dashboard card produces a named PDF', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		await b.seedMaster({ name: 'My Export CV' });
		await page.reload();

		const [download] = await Promise.all([
			page.waitForEvent('download', { timeout: 60_000 }),
			page.getByRole('button', { name: 'Export' }).first().click()
		]);

		expect(download.suggestedFilename()).toBe('My Export CV.pdf');
	});

	test('downloading from the editor toolbar produces a PDF', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster({ name: 'Editor Export CV' });
		await page.goto(`/cv/${masterId}`, { waitUntil: 'networkidle' });

		const downloadPromise = page.waitForEvent('download');
		await page.getByRole('button', { name: /^Export$/ }).click();
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toMatch(/\.pdf$/);
	});
});
