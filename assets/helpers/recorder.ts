import type { Page } from '@playwright/test';
import { videoToGif } from './gif';

// Playwright starts recording the moment the page is created and gives no way to
// pause or restart mid-session, so every capture inevitably opens on the blank
// landing page and the data-seeding churn. Rather than fight that, we let the
// recording run end to end and remember the wall-clock window that actually
// matters — from the point the target state is on screen to the end of the
// interaction — then trim everything else out when encoding the GIF.
//
// Offsets are measured from page creation (≈ video start). The drift between the
// two is small and steady, so a per-test nudge via the hold delays is enough to
// land the trim cleanly.

export interface MarkOptions {
	// Time to linger on this frame, included inside the kept window. At the start
	// this gives the viewer a beat to read the opening state; at the stop it lets
	// the final result breathe before the GIF loops.
	holdMs?: number;
}

export interface TrimWindow {
	startSec?: number;
	endSec?: number;
}

export class Recorder {
	private readonly t0: number;
	private startSec?: number;
	private endSec?: number;

	constructor(private readonly page: Page) {
		this.t0 = Date.now();
	}

	private elapsed(): number {
		return (Date.now() - this.t0) / 1000;
	}

	// Mark the first kept frame. Call once the target state is fully rendered;
	// the optional hold is recorded as the GIF's opening pause.
	async start({ holdMs = 0 }: MarkOptions = {}): Promise<void> {
		this.startSec = this.elapsed();
		if (holdMs) await this.page.waitForTimeout(holdMs);
	}

	// Mark the last kept frame. The optional hold is recorded as the closing pause
	// before the loop restarts.
	async stop({ holdMs = 0 }: MarkOptions = {}): Promise<void> {
		if (holdMs) await this.page.waitForTimeout(holdMs);
		this.endSec = this.elapsed();
	}

	window(): TrimWindow {
		return { startSec: this.startSec, endSec: this.endSec };
	}

	// Convenience wrapper: encode the recorded video, trimmed to the marked window.
	async toGif(videoPath: string, outputPath: string): Promise<void> {
		await videoToGif(videoPath, outputPath, this.window());
	}
}

export function createRecorder(page: Page): Recorder {
	return new Recorder(page);
}
