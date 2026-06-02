import { join } from 'node:path';
import { useBridge } from '@humblehire/test-bridge';
import type { Recipe } from '../recipe';
import { dwightContent } from '../helpers/dwight';
import {
	makeGifContext,
	openPage,
	gotoHome,
	activateMouseHelper,
	createRecorder,
	hoverAndClick,
	zoomTo,
	resetZoom
} from '../helpers/context';
import { videoToGif } from '../helpers/gif';

export const exportGif: Recipe = {
	name: 'export.gif',
	async run(ctx) {
		const { theme, outDir } = ctx;
		const context = await makeGifContext(ctx);
		const page = await openPage(context);
		const rec = createRecorder(page);

		try {
			// --- Setup (trimmed out of the GIF): seed a CV and load the dashboard ---
			await gotoHome(page);
			const b = await useBridge(page);
			await b.reset();
			await b.seedMaster({ name: 'Dwight K. Schrute', content: dwightContent });

			await page.reload({ waitUntil: 'networkidle' });
			await activateMouseHelper(page);
			await page.waitForSelector('[data-testid="master-group"]');

			// --- Recorded window starts here, on the loaded dashboard ---
			await rec.start({ holdMs: 1000 });

			// Push in on the card so the Export button is the clear focus.
			const exportBtn = page.getByRole('button', { name: 'Export' }).first();
			await zoomTo(page, exportBtn, { scale: 1.5, durationMs: 650 });

			// Register before click so a fast in-browser download cannot be missed.
			const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
			await hoverAndClick(page, exportBtn);
			await downloadPromise;
			await page.waitForTimeout(1000);
			await resetZoom(page);

			await rec.stop({ holdMs: 800 });
		} finally {
			const video = page.video()!;
			await context.close();
			const videoPath = await video.path();
			await videoToGif(videoPath, join(outDir, `export.${theme}.gif`), rec.window(), ctx.gif);
		}
	}
};
