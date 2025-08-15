import { expect, test } from '@playwright/test';

// TODO: add tests later, lol
test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});
