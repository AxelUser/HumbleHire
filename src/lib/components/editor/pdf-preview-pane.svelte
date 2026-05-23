<script lang="ts">
	import { tick } from 'svelte';
	import { generatePdfBlob } from '$lib/features/export/generate';
	import ZoomControls from '$lib/components/ui/zoom-controls/index.svelte';
	import type * as PDFJSLib from 'pdfjs-dist';
	import type { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
	import type { PDFPageProxy } from 'pdfjs-dist';
	import type { CV } from '$lib/types/cv';

	interface Props {
		cv: CV;
	}

	let { cv }: Props = $props();

	interface PageSpec {
		pageNum: number;
		numPages: number;
		cssWidth: number;
		cssHeight: number;
		physWidth: number;
		physHeight: number;
		canvas: HTMLCanvasElement | null;
		textDiv: HTMLElement | null;
	}

	let scrollContainer: HTMLDivElement;
	let renderVersion = 0;
	let cachedPdfDoc: PDFDocumentProxy | null = null;

	let pages = $state<PageSpec[]>([]);
	let statusMessage = $state('Loading preview…');

	// Non-reactive: PDF.js objects must not be wrapped in Svelte proxies
	let renderData: { page: PDFPageProxy; viewport: PageViewport; physViewport: PageViewport }[] = [];

	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 2.0;
	const ZOOM_STEP = 0.1;

	let zoomFactor = $state(1.0);

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

	// Only blocks and hiddenBlockIds affect the PDF output
	$effect(() => {
		const blocks = $state.snapshot(cv.blocks);
		const hiddenBlockIds = $state.snapshot(cv.hiddenBlockIds);
		const timer = setTimeout(() => regenerate({ ...cv, blocks, hiddenBlockIds } as CV), 1000);
		return () => clearTimeout(timer);
	});

	// When zoom changes, re-render from cached doc
	$effect(() => {
		const zoom = zoomFactor;
		if (!cachedPdfDoc) return;
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
		if (!scrollContainer) return;

		const baseWidth = scrollContainer.getBoundingClientRect().width - 32;
		if (baseWidth <= 0) return;

		const lib = await getPdfjsLib();
		const newSpecs: PageSpec[] = [];
		const newRenderData: typeof renderData = [];

		for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
			if (myVersion !== renderVersion) return;

			const page = await pdfDoc.getPage(pageNum);
			const naturalViewport = page.getViewport({ scale: 1 });
			const scale = (baseWidth / naturalViewport.width) * zoom;
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
			newRenderData.push({ page, viewport, physViewport });
		}

		if (myVersion !== renderVersion) return;

		renderData = newRenderData;
		pages = newSpecs;
		statusMessage = '';
		await tick();

		for (let i = 0; i < pages.length; i++) {
			if (myVersion !== renderVersion) return;

			const spec = pages[i];
			const data = renderData[i];
			if (!spec.canvas || !spec.textDiv) continue;

			await data.page.render({ canvas: spec.canvas, viewport: data.physViewport }).promise;
			if (myVersion !== renderVersion) return;

			const textLayer = new lib.TextLayer({
				textContentSource: data.page.streamTextContent(),
				container: spec.textDiv,
				viewport: data.viewport
			});
			await textLayer.render();
		}
	}

	function setMessage(msg: string) {
		pages = [];
		renderData = [];
		statusMessage = msg;
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
	<div
		class="bg-background border-foreground flex shrink-0 items-center gap-3 border-b-2 px-4 py-2"
	>
		<span class="text-muted-foreground text-xs font-bold tracking-widest uppercase">Preview</span>
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
	<div bind:this={scrollContainer} class="bg-muted flex-1 overflow-auto">
		<div class="min-w-full p-4">
			{#if statusMessage}
				<p class="text-muted-foreground p-6 text-center text-sm">{statusMessage}</p>
			{:else}
				{#each pages as spec (spec.pageNum)}
					<div
						style="position:relative; width:{spec.cssWidth}px; height:{spec.cssHeight}px; margin:0 auto 16px; box-shadow:4px 4px 0px 0px var(--shadow-color); background:white; overflow:hidden; flex-shrink:0"
					>
						<canvas
							bind:this={spec.canvas}
							width={spec.physWidth}
							height={spec.physHeight}
							style="width:{spec.cssWidth}px; height:{spec.cssHeight}px"
						></canvas>
						<div
							bind:this={spec.textDiv}
							class="pdfTextLayer"
							style="position:absolute;inset:0;width:{spec.cssWidth}px;height:{spec.cssHeight}px;overflow:hidden"
						></div>
						<div class="pdf-page-badge">{spec.pageNum} / {spec.numPages}</div>
					</div>
				{/each}
			{/if}
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
