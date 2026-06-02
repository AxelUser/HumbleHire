import { chromium } from 'playwright';
import { startPreview } from './server';
import { recipes } from './registry';
import { OUT_DIR } from './paths';
import type { Theme } from './helpers/context';

const THEMES: Theme[] = ['light', 'dark'];

// A single capture should never outlast this; the GIF walkthroughs are the long
// ones, and the old @playwright/test setup capped them at 120s too.
const RECIPE_TIMEOUT_MS = 120_000;

function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
	let timer: ReturnType<typeof setTimeout>;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
	});
	return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

// Build + preview the app, then drive every recipe across both themes against it.
// One browser for the whole run; each recipe owns its context. Failures are
// collected so one bad capture doesn't abandon the rest, then surfaced at the end.
export async function generateAll(): Promise<void> {
	const server = await startPreview();
	const browser = await chromium.launch();
	const failures: string[] = [];

	try {
		for (const theme of THEMES) {
			for (const recipe of recipes) {
				const label = `${recipe.name} [${theme}]`;
				process.stdout.write(`▶ ${label}\n`);
				try {
					await withTimeout(
						recipe.run({ browser, theme, outDir: OUT_DIR }),
						RECIPE_TIMEOUT_MS,
						label
					);
					process.stdout.write(`  ✓ ${label}\n`);
				} catch (err) {
					failures.push(label);
					process.stderr.write(`  ✗ ${label}: ${(err as Error).message}\n`);
				}
			}
		}
	} finally {
		await browser.close();
		await server.stop();
	}

	if (failures.length > 0) {
		throw new Error(`${failures.length} capture(s) failed: ${failures.join(', ')}`);
	}
	process.stdout.write(`\nDone — assets written to ${OUT_DIR}\n`);
}
