import type { CVBlocks } from '$lib/types/cv';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CVDocDefinition = Record<string, any>;

export type ThemeModule = {
	name: string;
	build: (blocks: Partial<CVBlocks>) => CVDocDefinition;
};
