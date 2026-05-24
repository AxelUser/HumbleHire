import type * as PDFJSLib from 'pdfjs-dist';

let lib: typeof PDFJSLib | null = null;

export async function getPdfjsLib(): Promise<typeof PDFJSLib> {
	if (lib) return lib;
	lib = await import('pdfjs-dist');
	if (!lib.GlobalWorkerOptions.workerSrc) {
		lib.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.mjs',
			import.meta.url
		).href;
	}
	return lib;
}
