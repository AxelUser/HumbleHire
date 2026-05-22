import type { CV } from '$lib/types/cv';
import { preprocessBlocks } from './preprocess';
import { themes, DEFAULT_THEME_KEY } from './themes/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedPdfMake: any = null;

async function getPdfMake() {
	if (cachedPdfMake) return cachedPdfMake;

	const [pdfMakeModule, vfsModule] = await Promise.all([
		import('pdfmake/build/pdfmake'),
		import('pdfmake/build/vfs_fonts')
	]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pdfMake = (pdfMakeModule as any).default ?? pdfMakeModule;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const vfs = (vfsModule as any).default ?? vfsModule;
	pdfMake.addVirtualFileSystem(vfs);

	cachedPdfMake = pdfMake;
	return pdfMake;
}

function buildDocDef(cv: CV) {
	const blocks = preprocessBlocks(cv);
	const theme = themes[DEFAULT_THEME_KEY];
	return theme.build(blocks);
}

function sanitizeFilename(name: string): string {
	return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim() || 'cv';
}

export async function generatePdfBlob(cv: CV): Promise<Blob> {
	const pdfMake = await getPdfMake();
	return pdfMake.createPdf(buildDocDef(cv)).getBlob();
}

export async function downloadPdf(cv: CV): Promise<void> {
	const pdfMake = await getPdfMake();
	const filename = `${sanitizeFilename(cv.name)}.pdf`;
	await pdfMake.createPdf(buildDocDef(cv)).download(filename);
}
