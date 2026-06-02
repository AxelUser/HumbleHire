import type { Browser } from 'playwright';
import type { Theme } from './helpers/context';

// A recipe is one documentation artifact: it gets a browser and a theme, opens
// its own context (PNG or video, via the context helpers), drives the app, and
// writes one file into outDir. Recipes don't assert — they're capture scripts,
// not tests, which is why they no longer ride on @playwright/test. See ADR-006.
export interface RecipeContext {
	browser: Browser;
	theme: Theme;
	// The committed docs/assets directory. Recipes build their own filename from
	// it, embedding the theme (e.g. `dashboard.dark.png`).
	outDir: string;
}

export interface Recipe {
	// Stable label used in CLI output and logs.
	name: string;
	run(ctx: RecipeContext): Promise<void>;
}
