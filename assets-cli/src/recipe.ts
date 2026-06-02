import type { CaptureOptions } from './helpers/context';
import type { GifEncodeOptions } from './helpers/gif';

// A recipe is one documentation artifact: it gets a browser, a theme, and the run
// config, opens its own context (PNG or video, via the context helpers), drives
// the app, and writes one file into outDir. Recipes don't assert — they're capture
// scripts, not tests. Every tunable here comes from the CLI config, so recipes hold
// no hardcoded sizes or formats.
//
// Extends CaptureOptions (browser, theme, baseUrl, deviceScaleFactor) so a recipe
// passes itself straight to makePngContext / makeGifContext.
export interface RecipeContext extends CaptureOptions {
	// The output directory artifacts are written to (the `--out` dir). Recipes
	// build their own filename from it, embedding the theme (e.g. `dashboard.dark.png`).
	outDir: string;
	// GIF encode settings for the motion captures.
	gif: GifEncodeOptions;
}

export interface Recipe {
	// Stable label used in CLI output and logs.
	name: string;
	run(ctx: RecipeContext): Promise<void>;
}
