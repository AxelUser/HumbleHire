import { test, expect } from '@playwright/test';
import { useBridge } from './helpers/bridge';
import { fillInlineField, gotoHome, waitForAutosave, reorder } from './helpers/ui';
import type { CV } from '$lib/types/cv';

test.describe('Editor', () => {
	test('creates a blank CV and opens the editor', async ({ page }) => {
		await gotoHome(page);
		await page.getByRole('button', { name: 'Create your first CV' }).click();
		await expect(page).toHaveURL(/\/cv\/.+/, { timeout: 15_000 });
		await expect(page.getByText('Untitled CV')).toBeVisible();
	});

	test('editing a field saves and persists on reload', async ({ page }) => {
		await gotoHome(page);
		await page.getByRole('button', { name: 'Create your first CV' }).click();
		await expect(page).toHaveURL(/\/cv\/.+/, { timeout: 15_000 });

		await fillInlineField(page, 'Your full name', 'Jane Smith');
		await page.keyboard.press('Escape');

		const cvId = page.url().split('/cv/')[1];
		const b = await useBridge(page);
		await expect
			.poll(async () => ((await b.getCv(cvId)) as CV | undefined)?.blocks?.fullName?.value)
			.toBe('Jane Smith');

		await page.reload();
		await expect(page.getByText('Jane Smith')).toBeVisible();
	});

	test('adds and removes a job history entry', async ({ page }) => {
		await gotoHome(page);
		await page.getByRole('button', { name: 'Create your first CV' }).click();
		await expect(page).toHaveURL(/\/cv\/.+/, { timeout: 15_000 });

		await page.getByRole('button', { name: 'Add Job' }).click();
		await expect(page.getByTestId('job-entry')).toHaveCount(1);

		await page.getByTestId('job-entry').getByRole('button', { name: 'Remove job' }).click();
		await expect(page.getByTestId('job-entry')).toHaveCount(0);
	});

	test('adds a skill tag by pressing Enter', async ({ page }) => {
		await gotoHome(page);
		await page.getByRole('button', { name: 'Create your first CV' }).click();
		await expect(page).toHaveURL(/\/cv\/.+/, { timeout: 15_000 });

		const tagInput = page.getByPlaceholder('Add skill (e.g. React, AWS, Leadership)');
		await tagInput.fill('TypeScript');
		await page.keyboard.press('Enter');

		await expect(page.getByText('TypeScript')).toBeVisible();
	});

	test('hiding a block removes its content from the editor view', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster();
		await page.goto(`/cv/${masterId}`);

		const positionBlock = page.getByTestId('block-position');
		await positionBlock.getByRole('button', { name: 'Hide section' }).click();
		await expect(positionBlock.getByText('Section hidden')).toBeVisible();
	});

	test.skip('reordering job history entries persists after reload', async ({ page }) => {
		await gotoHome(page);
		const b = await useBridge(page);
		const masterId = await b.seedMaster();
		await page.goto(`/cv/${masterId}`);

		// Dummy CV has 3 jobs: Nimbus Labs (0), Cobalt Financial (1), Bright Pixel Studio (2)
		const entries = page.getByTestId('job-entry');
		await expect(entries).toHaveCount(3);
		await expect(entries.nth(0)).toContainText('Nimbus Labs');

		// Drag first entry to the position of the third
		await reorder(page, entries.nth(0).getByTestId('drag-handle'), entries.nth(2));

		await waitForAutosave(page);
		await page.reload();

		// Nimbus Labs should now be at the end
		await expect(page.getByTestId('job-entry')).toHaveCount(3);
		await expect(page.getByTestId('job-entry').nth(0)).not.toContainText('Nimbus Labs');
		await expect(page.getByTestId('job-entry').nth(2)).toContainText('Nimbus Labs');
	});
});
