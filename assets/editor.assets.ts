import { test } from '@playwright/test';
import { useBridge } from './helpers/bridge';
import { dwightContent } from './helpers/dwight';
import {
	themeOf,
	makePngContext,
	makeGifContext,
	openPage,
	gotoHome,
	activateMouseHelper,
	waitForPdfPreview,
	captureScreenshot
} from './helpers/context';
import { videoToGif } from './helpers/gif';
import { hoverAndClick } from './helpers/mouse';

test('capture editor png', async ({ browser }, testInfo) => {
	const theme = themeOf(testInfo);
	const context = await makePngContext(browser, theme);
	const page = await openPage(context);

	try {
		await gotoHome(page);
		const b = await useBridge(page);
		await b.reset();
		const masterId = await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });

		await page.goto(`/cv/${masterId}`, { waitUntil: 'networkidle' });
		await waitForPdfPreview(page);

		await captureScreenshot(page, `docs/assets/editor.${theme}.png`);
	} finally {
		await context.close();
	}
});

test('capture editor gif', async ({ browser }, testInfo) => {
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

		await page.goto(`/cv/${masterId}`, { waitUntil: 'networkidle' });
		await activateMouseHelper(page);
		await waitForPdfPreview(page);

		// Scroll the Highlights block into view
		const highlightsBlock = page.getByTestId('block-highlights');
		await highlightsBlock.scrollIntoViewIfNeeded();
		await page.waitForTimeout(500);

		// Move cursor to the Add Highlight button and click it
		const addHighlightBtn = page.getByRole('button', { name: 'Add Highlight' });
		await hoverAndClick(page, addHighlightBtn);
		await page.waitForTimeout(300);

		// Click the new (empty) highlight span to activate the textarea
		const newSpan = page.getByRole('button', { name: 'Add a highlight...' }).last();
		await hoverAndClick(page, newSpan);

		// Type the Battlestar Galactica line slowly so it looks natural on screen
		await page
			.getByPlaceholder('Add a highlight...')
			.last()
			.pressSequentially('Bears. Beets. Battlestar Galactica.', { delay: 70 });

		// Wait for the preview to re-render with the new text
		await page.waitForTimeout(3500);
	} finally {
		const video = page.video()!;
		await context.close();
		const videoPath = await video.path();
		await videoToGif(videoPath, `docs/assets/editor.${theme}.gif`);
	}
});
