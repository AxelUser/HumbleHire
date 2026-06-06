import type { CVContent } from '$lib/types/cv';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export type { TDocumentDefinitions };

export type ThemeModule = {
	name: string;
	build: (content: CVContent) => TDocumentDefinitions;
};
