import type { PDFDocumentProxy, PDFPageProxy, PageViewport, RenderTask } from 'pdfjs-dist';
import { getPdfjsLib } from './pdfjs';

export interface PageSpec {
	pageNum: number;
	numPages: number;
	cssWidth: number;
	cssHeight: number;
	physWidth: number;
	physHeight: number;
	canvas: HTMLCanvasElement | null;
	textDiv: HTMLElement | null;
}

interface RenderData {
	page: PDFPageProxy;
	viewport: PageViewport;
	physViewport: PageViewport;
}

export interface BuildResult {
	specs: PageSpec[];
	version: number;
}

export class PdfRenderController {
	private version = 0;
	private activeTasks: RenderTask[] = [];
	private renderDataMap = new Map<number, RenderData>();

	// Phase 1: compute page dimensions and fetch PDF.js page objects.
	// Returns null if superseded by a newer call before completing.
	async buildSpecs(pdfDoc: PDFDocumentProxy, scale: number): Promise<BuildResult | null> {
		this.activeTasks.splice(0).forEach((t) => t.cancel());
		const myVersion = ++this.version;

		const newSpecs: PageSpec[] = [];
		const newRenderData = new Map<number, RenderData>();

		for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
			if (myVersion !== this.version) return null;

			const page = await pdfDoc.getPage(pageNum);
			const viewport = page.getViewport({ scale });

			const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
			const physViewport = page.getViewport({ scale: scale * dpr });

			newSpecs.push({
				pageNum,
				numPages: pdfDoc.numPages,
				cssWidth: viewport.width,
				cssHeight: viewport.height,
				physWidth: Math.floor(physViewport.width),
				physHeight: Math.floor(physViewport.height),
				canvas: null,
				textDiv: null
			});
			newRenderData.set(pageNum, { page, viewport, physViewport });
		}

		if (myVersion !== this.version) return null;

		this.renderDataMap = newRenderData;
		return { specs: newSpecs, version: myVersion };
	}

	// Phase 2: paint to the canvas/textDiv elements bound by Svelte after tick().
	// The caller must pass the version token from buildSpecs to detect supersession.
	async paint(specs: PageSpec[], version: number): Promise<void> {
		if (version !== this.version) return;

		const lib = await getPdfjsLib();

		for (const spec of specs) {
			if (version !== this.version) return;

			const canvas = spec.canvas;
			const textDiv = spec.textDiv;
			if (!canvas || !textDiv) continue;

			// Keyed by pageNum — immune to index-based desync between specs and render data.
			const data = this.renderDataMap.get(spec.pageNum);
			if (!data) continue;

			textDiv.replaceChildren();

			const renderTask = data.page.render({ canvas, viewport: data.physViewport });
			this.activeTasks.push(renderTask);
			try {
				await renderTask.promise;
			} catch {
				return;
			} finally {
				this.activeTasks = this.activeTasks.filter((t) => t !== renderTask);
			}

			if (version !== this.version) return;

			const textLayer = new lib.TextLayer({
				textContentSource: data.page.streamTextContent(),
				container: textDiv,
				viewport: data.viewport
			});
			await textLayer.render();

			if (version !== this.version) return;

			textDiv.style.setProperty('--total-scale-factor', String(data.viewport.scale));
		}
	}

	cancelAll(): void {
		this.activeTasks.splice(0).forEach((t) => t.cancel());
		this.version++;
	}
}
