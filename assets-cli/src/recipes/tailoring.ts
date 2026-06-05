import { join } from 'node:path';
import { useBridge } from '@humblehire/dev-bridge';
import type { Recipe } from '../recipe';
import { dwightContent } from '../helpers/dwight';
import {
	makeGifContext,
	openPage,
	gotoHome,
	activateMouseHelper,
	createRecorder,
	hoverAndClick,
	moveCursor,
	zoomTo,
	zoomToPoint,
	resetZoom
} from '../helpers/context';
import { videoToGif } from '../helpers/gif';

export const tailoring: Recipe = {
	name: 'tailoring.gif',
	async run(ctx) {
		const { theme, outDir } = ctx;
		const context = await makeGifContext(ctx);
		const page = await openPage(context);
		const rec = createRecorder(page);

		try {
			// --- Setup (trimmed out of the GIF): seed a master + tailored copy, then
			// patch the master so two diff items exist for the sync demo:
			//   - position: Dwight refuses "TO THE"
			//   - location: accept the farm address
			await gotoHome(page);
			const b = await useBridge(page);
			await b.reset();

			const masterId = await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });
			const tailoredId = await b.seedTailored(masterId, {
				name: 'Regional Manager — Dunder Mifflin',
				company: 'Dunder Mifflin Paper Company'
			});
			await b.patchMaster(masterId, {
				position: 'Assistant TO THE Regional Manager',
				location: 'Scranton, PA — Schrute Farms'
			});

			// Open the tailored CV editor (setup — the recording starts here, on the
			// opened CV page, not on the dashboard).
			await page.goto(`/cv/${tailoredId}`, { waitUntil: 'networkidle' });
			await activateMouseHelper(page);

			// Wait for the Review · Sync button (requires the master CV to load).
			const reviewBtn = page.getByRole('button', { name: /Review/ });
			await reviewBtn.waitFor({ state: 'visible', timeout: 15_000 });
			await page.waitForTimeout(500);

			// --- Recorded window starts here, on the opened CV editor ---
			await rec.start({ holdMs: 1000 });

			// Open the sync drawer.
			await hoverAndClick(page, reviewBtn);

			// Wait for the sync panel with 2 changes.
			await page.waitForSelector(':text("2 changes")');
			await page.waitForTimeout(800);

			// Each decision item is a card in the drawer; we frame one at a time so the
			// viewer follows the choice being made. Scope to the drawer dialog — the
			// editor blocks behind it share the same card classes, and matching those
			// would send the camera lurching to the left column instead. The drawer is
			// pinned to the right edge, so the camera centres each item as far as it can
			// without exposing a blank gutter past the page edge.
			const items = page.getByRole('dialog').locator('.rounded-lg.border.p-4');

			// Push in on the first change and dismiss it (Dwight would never accept "TO THE").
			await zoomTo(page, items.first(), { scale: 1.4, durationMs: 600 });
			const dismissBtn = page.getByRole('button', { name: 'Dismiss change' }).first();
			await hoverAndClick(page, dismissBtn);
			await page.waitForTimeout(700);

			// Pan to the second change and accept it (the farm address).
			await zoomTo(page, items.last(), { scale: 1.4, durationMs: 600 });
			const acceptBtn = page.getByRole('button', { name: 'Accept change' }).first();
			await hoverAndClick(page, acceptBtn);
			await page.waitForTimeout(700);

			// Apply — now enabled since both items are decided — then pull the camera back
			// out as the drawer closes.
			const applyBtn = page.getByRole('button', { name: 'Apply changes' });
			await hoverAndClick(page, applyBtn);
			await resetZoom(page);

			// The applied location change re-renders the PDF; move the camera onto the
			// preview so the viewer sees it land on the page.
			const canvas = page.locator('canvas').first();
			await canvas.waitFor({ state: 'visible', timeout: 15_000 });
			await page.waitForTimeout(1800);
			const cbox = await canvas.boundingBox();
			if (cbox) {
				// Aim at the header area near the top of the page, where the location sits,
				// and rest the cursor there to point at the line that just changed.
				await moveCursor(page, cbox.x + cbox.width / 2, cbox.y + cbox.height * 0.16);
				await zoomToPoint(page, cbox.x + cbox.width / 2, cbox.y + cbox.height * 0.16, {
					scale: 1.7,
					durationMs: 700
				});
			}
			await page.waitForTimeout(2000);
			await resetZoom(page);

			await rec.stop({ holdMs: 900 });
		} finally {
			const video = page.video()!;
			await context.close();
			const videoPath = await video.path();
			await videoToGif(videoPath, join(outDir, `tailoring.${theme}.gif`), rec.window(), ctx.gif);
		}
	}
};
