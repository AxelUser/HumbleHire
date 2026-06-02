import { test, expect } from '@playwright/test';
import { useBridge } from '@humblehire/test-bridge';
import { gotoHome } from './helpers/ui';

test.describe('Dashboard', () => {
	test('shows hero page when no CVs exist', async ({ page }) => {
		await gotoHome(page);
		await expect(page.getByRole('heading', { level: 1 })).toContainText('One CV.');
		await expect(page.getByRole('button', { name: 'Create your first CV' })).toBeVisible();
	});

	test('groups tailored copies nested under their master', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster({ name: 'Main CV' });
		await b.seedTailored(masterId, { name: 'Tailored Copy', company: 'Acme Corp' });
		await page.reload();

		await expect(page.getByText('Main CV')).toBeVisible();
		await expect(page.getByText('Acme Corp')).toBeVisible();
		await expect(page.getByTestId('master-group').getByText('1 tailored copy')).toBeVisible();
	});

	test('filters CV list by search query', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		await b.seedMaster({ name: 'Frontend Engineer' });
		await b.seedMaster({ name: 'Backend Developer' });
		await page.reload();

		await page.getByPlaceholder('Search by name or company…').fill('Frontend');
		await expect(page.getByText('Frontend Engineer')).toBeVisible();
		await expect(page.getByText('Backend Developer')).not.toBeVisible();
		await expect(page.getByText('1 match')).toBeVisible();

		await page.getByRole('button', { name: 'Clear search' }).click();
		await expect(page.getByText('Backend Developer')).toBeVisible();
	});

	test('navigates to the editor when clicking Open on a card', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster();
		await page.reload();

		await page.getByRole('link', { name: 'Open' }).first().click();
		await expect(page).toHaveURL(`/cv/${masterId}`);
	});
});
