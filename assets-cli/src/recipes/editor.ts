import { join } from 'node:path';
import { useBridge } from '@humblehire/test-bridge';
import type { Recipe } from '../recipe';
import { dwightContent } from '../helpers/dwight';
import {
	makePngContext,
	makeGifContext,
	openPage,
	gotoHome,
	activateMouseHelper,
	waitForPdfPreview,
	captureScreenshot,
	createRecorder,
	hoverAndClick,
	moveTo,
	zoomTo,
	resetZoom
} from '../helpers/context';
import { videoToGif } from '../helpers/gif';

export const editorScreenshot: Recipe = {
	name: 'editor.png',
	async run({ browser, theme, outDir }) {
		const context = await makePngContext(browser, theme);
		const page = await openPage(context);

		try {
			await gotoHome(page);
			const b = await useBridge(page);
			await b.reset();
			const masterId = await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });

			await page.goto(`/cv/${masterId}`, { waitUntil: 'networkidle' });
			await waitForPdfPreview(page);

			await captureScreenshot(page, join(outDir, `editor.${theme}.png`));
		} finally {
			await context.close();
		}
	}
};

export const editorWalkthrough: Recipe = {
	name: 'editor.gif',
	async run({ browser, theme, outDir }) {
		const context = await makeGifContext(browser, theme);
		const page = await openPage(context);
		const rec = createRecorder(page);

		try {
			// --- Setup (trimmed out of the GIF): land on the editor with the CV open ---
			await gotoHome(page);
			const b = await useBridge(page);
			await b.reset();
			const masterId = await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });

			await page.goto(`/cv/${masterId}`, { waitUntil: 'networkidle' });
			await activateMouseHelper(page);
			await waitForPdfPreview(page);

			// Bring the Highlights block into view before recording starts so the GIF
			// opens already framed on the part of the editor we are about to change.
			const highlightsBlock = page.getByTestId('block-highlights');
			await highlightsBlock.scrollIntoViewIfNeeded();
			await page.waitForTimeout(500);

			// --- Recorded window starts here, on the target state ---
			await rec.start({ holdMs: 800 });

			// Push in on the Add Highlight control: the new highlight lands just above
			// it, so framing here keeps the field we are about to fill in view with the
			// whole editor column still visible.
			const addHighlightBtn = page.getByRole('button', { name: 'Add Highlight' });
			await zoomTo(page, addHighlightBtn, { scale: 1.3, durationMs: 650 });

			await hoverAndClick(page, addHighlightBtn);
			await page.waitForTimeout(300);

			// Click the new (empty) highlight span to activate the textarea.
			const newSpan = page.getByRole('button', { name: 'Add a highlight...' }).last();
			await hoverAndClick(page, newSpan);

			// Type the Battlestar Galactica line slowly so it looks natural on screen.
			const input = page.getByPlaceholder('Add a highlight...').last();
			await input.pressSequentially('Bears. Beets. Battlestar Galactica.', { delay: 70 });

			// Scroll the new line to the middle of the column so the blocks below it come
			// into view underneath — the field then frames centred instead of pinned to
			// the bottom edge.
			await page.waitForTimeout(600);
			await input.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'smooth' }));
			await page.waitForTimeout(700);

			// Pan to centre precisely on the field now that it holds text, then rest the
			// cursor on it (after the zoom, so it lands on the field's new position).
			await zoomTo(page, input, { scale: 1.4, durationMs: 600 });
			await moveTo(page, input);

			// Hold on the result (the preview also finishes re-rendering), then pull out.
			await page.waitForTimeout(2000);
			await resetZoom(page);

			await rec.stop({ holdMs: 700 });
		} finally {
			const video = page.video()!;
			await context.close();
			const videoPath = await video.path();
			await videoToGif(videoPath, join(outDir, `editor.${theme}.gif`), rec.window());
		}
	}
};
