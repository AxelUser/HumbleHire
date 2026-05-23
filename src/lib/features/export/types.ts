import type { CVBlocks } from '$lib/types/cv';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export type { TDocumentDefinitions };

export type ThemeModule = {
	name: string;
	build: (blocks: Partial<CVBlocks>) => TDocumentDefinitions;
};
