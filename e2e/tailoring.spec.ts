import { test, expect } from '@playwright/test';
import { useBridge } from '@humblehire/dev-bridge';
import { gotoHome } from './helpers/ui';

test.describe('Tailoring', () => {
	test('creating a tailored copy nests it under the master', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster({ name: 'Base CV' });
		await page.reload();

		// Open tailor dialog from the master card
		await page.getByTestId('master-group').getByRole('button', { name: 'Tailor a copy' }).click();
		await page.getByLabel('Company').fill('Stripe');
		await page.getByLabel('Name').fill('Senior Engineer');
		await page.getByRole('button', { name: 'Create' }).click();

		// Navigates to the new tailored CV
		await expect(page).toHaveURL(/\/cv\/.+/);
		await expect(page).not.toHaveURL(`/cv/${masterId}`);

		// Dashboard shows it nested
		await gotoHome(page);
		await expect(page.getByTestId('master-group').getByText('1 tailored copy')).toBeVisible();
		await expect(
			page.getByTestId('master-group').getByText('Stripe', { exact: true })
		).toBeVisible();
	});

	test('a tailored CV has no Tailor a copy action', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster();
		const tailoredId = await b.seedTailored(masterId, { company: 'Acme' });
		await page.goto(`/cv/${tailoredId}`);

		await expect(page.getByRole('button', { name: 'Tailor a copy' })).not.toBeVisible();
	});

	test('shows updates-available indicator when master has changed', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster();
		await b.seedTailored(masterId);
		await b.patchMaster(masterId, { position: 'Updated Position' });
		await page.reload();

		await expect(page.getByTestId('sync-indicator')).toContainText('master updated');
	});

	test('sync view: accepting and dismissing changes enables Apply', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster();
		const tailoredId = await b.seedTailored(masterId);
		// Two text-block changes → two diff items
		await b.patchMaster(masterId, { position: 'New Position', location: 'New Location' });
		await page.goto(`/cv/${tailoredId}`);

		await page.getByRole('button', { name: /Review/ }).click();
		await expect(page.getByText(/2 changes/)).toBeVisible();

		// Accept the first item, dismiss the second
		await page.getByRole('button', { name: 'Accept change' }).first().click();
		await page.getByRole('button', { name: 'Dismiss change' }).first().click();

		// Apply is now enabled (0 pending)
		const applyBtn = page.getByRole('button', { name: 'Apply changes' });
		await expect(applyBtn).toBeEnabled();
		await applyBtn.click();

		// Sync drawer closed
		await expect(page.getByText(/2 changes/)).not.toBeVisible();
	});

	test('deleting a master and keeping copies makes them standalone', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster({ name: 'Master to Delete' });
		await b.seedTailored(masterId, { name: 'Keep Me', company: 'Acme' });
		await page.reload();

		// Delete the master
		const masterGroup = page.getByTestId('master-group').filter({ hasText: 'Master to Delete' });
		await masterGroup.getByRole('button', { name: 'Delete CV' }).click();

		// Confirm dialog: keep copies as standalone
		await expect(page.getByRole('alertdialog')).toBeVisible();
		await page.getByRole('button', { name: 'Keep as standalone' }).click();

		// Exactly 1 master-group remains: the orphaned tailored now acts as standalone
		await expect(page.getByTestId('master-group')).toHaveCount(1);
		await expect(
			page.getByTestId('master-group').getByText('Keep Me', { exact: true })
		).toBeVisible();

		// No sync indicator since it's no longer linked to a master
		await expect(page.getByTestId('sync-indicator')).not.toBeVisible();
	});

	test('opening a tailored CV whose master is gone orphans it silently', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const tailoredId = await b.seedOrphanedTailored({ name: 'Was Tailored' });
		await page.goto(`/cv/${tailoredId}`);

		// Verify the page loaded and didn't redirect away
		await expect(page).toHaveURL(`/cv/${tailoredId}`);

		// Wait for the editor to fully load
		await expect(page.getByText('Was Tailored')).toBeVisible();

		// No "Review · Sync" button — the orphaned CV has no master to sync from
		await expect(page.getByRole('button', { name: /Review/ })).not.toBeVisible();
	});
});
