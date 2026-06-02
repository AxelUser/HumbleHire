import type { Recipe } from './recipe';
import { dashboard } from './recipes/dashboard';
import { editorScreenshot, editorWalkthrough } from './recipes/editor';
import { exportGif } from './recipes/export';
import { dashboardSearch } from './recipes/dashboard-search';
import { tailoring } from './recipes/tailoring';

// Every documentation artifact, in the order they're captured. Adding a capture
// means adding a recipe module and listing it here — nothing else in the harness
// needs to know about it.
export const recipes: Recipe[] = [
	dashboard,
	editorScreenshot,
	editorWalkthrough,
	exportGif,
	dashboardSearch,
	tailoring
];
