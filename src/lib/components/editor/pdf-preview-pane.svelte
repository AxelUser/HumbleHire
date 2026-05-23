<script lang="ts">
	import { generatePdfBlob } from '$lib/features/export/generate';
	import ZoomControls from '$lib/components/ui/zoom-controls/index.svelte';
	import type * as PDFJSLib from 'pdfjs-dist';
	import type { PDFDocumentProxy } from 'pdfjs-dist';
	import type { CV } from '$lib/types/cv';

	interface Props {
		cv: CV;
	}

	let { cv }: Props = $props();

	let scrollContainer: HTMLDivElement;
	let pagesContainer: HTMLDivElement;
	let renderVersion = 0;
	let cachedPdfDoc: PDFDocumentProxy | null = null;

	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 2.0;
	const ZOOM_STEP = 0.1;

	let zoomFactor = $state(1.0);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pdfjsLib: typeof PDFJSLib | null = null;

	async function getPdfjsLib() {
		if (pdfjsLib) return pdfjsLib;
		pdfjsLib = await import('pdfjs-dist');
		if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
			pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
				'pdfjs-dist/build/pdf.worker.min.mjs',
				import.meta.url
			).href;
		}
		return pdfjsLib;
	}

	// CV changes → full regeneration (debounced)
	$effect(() => {
		const snapshot = $state.snapshot(cv);
		const timer = setTimeout(() => regenerate(snapshot as CV), 1000);
		return () => clearTimeout(timer);
	});

	// Zoom changes → re-render from cached doc (immediate)
	$effect(() => {
		const zoom = zoomFactor;
		if (!cachedPdfDoc || !pagesContainer) return;
		const myVersion = ++renderVersion;
		renderPages(cachedPdfDoc, zoom, myVersion);
	});

	async function regenerate(snapshot: CV) {
		const myVersion = ++renderVersion;
		setMessage('Generating preview…');

		try {
			const blob = await generatePdfBlob(snapshot);
			if (myVersion !== renderVersion) return;

			const lib = await getPdfjsLib();
			if (myVersion !== renderVersion) return;

			const arrayBuffer = await blob.arrayBuffer();

			if (cachedPdfDoc) {
				cachedPdfDoc.destroy();
				cachedPdfDoc = null;
			}

			const pdfDoc = await lib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
			if (myVersion !== renderVersion) {
				pdfDoc.destroy();
				return;
			}

			cachedPdfDoc = pdfDoc;
			await renderPages(pdfDoc, zoomFactor, myVersion);
		} catch (err) {
			if (myVersion !== renderVersion) return;
			console.error('PDF preview error:', err);
			setMessage('Preview unavailable.');
		}
	}

	async function renderPages(pdfDoc: PDFDocumentProxy, zoom: number, myVersion: number) {
		if (!scrollContainer || !pagesContainer) return;

		const baseWidth = scrollContainer.getBoundingClientRect().width - 32;
		if (baseWidth <= 0) return;

		pagesContainer.innerHTML = '';

		const lib = await getPdfjsLib();

		for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
			if (myVersion !== renderVersion) return;

			const page = await pdfDoc.getPage(pageNum);
			const naturalViewport = page.getViewport({ scale: 1 });
			const scale = (baseWidth / naturalViewport.width) * zoom;
			const viewport = page.getViewport({ scale });

			const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
			const physViewport = page.getViewport({ scale: scale * dpr });

			const wrapper = document.createElement('div');
			wrapper.style.cssText = [
				`position: relative`,
				`width: ${viewport.width}px`,
				`height: ${viewport.height}px`,
				`margin: 0 auto 16px`,
				`box-shadow: 4px 4px 0px 0px var(--shadow-color)`,
				`background: white`,
				`overflow: hidden`,
				`flex-shrink: 0`
			].join(';');

			const canvas = document.createElement('canvas');
			canvas.width = Math.floor(physViewport.width);
			canvas.height = Math.floor(physViewport.height);
			canvas.style.width = `${viewport.width}px`;
			canvas.style.height = `${viewport.height}px`;

			const textDiv = document.createElement('div');
			textDiv.className = 'pdfTextLayer';
			textDiv.style.cssText = `position:absolute;inset:0;width:${viewport.width}px;height:${viewport.height}px;overflow:hidden`;

			const badge = document.createElement('div');
			badge.className = 'pdf-page-badge';
			badge.textContent = `${pageNum} / ${pdfDoc.numPages}`;

			wrapper.appendChild(canvas);
			wrapper.appendChild(textDiv);
			wrapper.appendChild(badge);
			pagesContainer.appendChild(wrapper);

			await page.render({ canvas, viewport: physViewport }).promise;
			if (myVersion !== renderVersion) return;

			const textLayer = new lib.TextLayer({
				textContentSource: page.streamTextContent(),
				container: textDiv,
				viewport
			});
			await textLayer.render();
		}
	}

	function setMessage(msg: string) {
		if (pagesContainer) {
			pagesContainer.innerHTML = `<p class="p-6 text-center text-sm text-muted-foreground">${msg}</p>`;
		}
	}

	function zoomIn() {
		zoomFactor = Math.min(MAX_ZOOM, Math.round((zoomFactor + ZOOM_STEP) * 10) / 10);
	}

	function zoomOut() {
		zoomFactor = Math.max(MIN_ZOOM, Math.round((zoomFactor - ZOOM_STEP) * 10) / 10);
	}

	function fitToScreen() {
		zoomFactor = 1.0;
	}
</script>

<div class="flex h-full flex-col">
	<!-- Zoom toolbar -->
	<div class="bg-background border-foreground flex shrink-0 items-center gap-3 border-b-2 px-4 py-2">
		<span class="text-muted-foreground text-xs font-bold uppercase tracking-widest">Preview</span>
		<ZoomControls
			{zoomFactor}
			onZoomIn={zoomIn}
			onZoomOut={zoomOut}
			onFitToScreen={fitToScreen}
			minZoom={MIN_ZOOM}
			maxZoom={MAX_ZOOM}
		/>
	</div>

	<!-- Scrollable pages area -->
	<div bind:this={scrollContainer} class="flex-1 overflow-auto bg-neutral-100">
		<div bind:this={pagesContainer} class="min-w-full p-4">
			<p class="text-muted-foreground p-6 text-center text-sm">Loading preview…</p>
		</div>
	</div>
</div>

<style>
	:global {
		.pdf-page-badge {
			position: absolute;
			top: 8px;
			right: 8px;
			background-color: var(--foreground);
			color: var(--background);
			font-size: 0.75rem;
			font-weight: 700;
			padding: 2px 6px;
			line-height: 1.4;
			pointer-events: none;
			user-select: none;
		}

		.pdfTextLayer {
			user-select: text;
			-webkit-user-select: text;
			pointer-events: auto;
		}

		.pdfTextLayer span,
		.pdfTextLayer br {
			position: absolute;
			white-space: pre;
			cursor: text;
			transform-origin: 0% 0%;
			color: transparent;
		}

		.pdfTextLayer .highlight {
			background-color: oklch(0.52 0.16 252 / 0.15);
			border-radius: 2px;
		}

		.pdfTextLayer ::selection {
			background: oklch(0.52 0.16 252 / 0.3);
			color: transparent;
		}
	}
</style>
