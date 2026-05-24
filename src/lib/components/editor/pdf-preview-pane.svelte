<script lang="ts">
	import { tick } from 'svelte';
	import { generatePdfBlob } from '$lib/features/export/generate';
	import { getPdfjsLib } from '$lib/features/export/pdfjs';
	import { PdfRenderController } from '$lib/features/export/render-controller';
	import type { PageSpec } from '$lib/features/export/render-controller';
	import ZoomControls from '$lib/components/ui/zoom-controls/index.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { PDFDocumentProxy } from 'pdfjs-dist';
	import type { CV } from '$lib/types/cv';

	interface Props {
		cv: CV;
	}

	let { cv }: Props = $props();

	let scrollContainer: HTMLDivElement;
	let generateVersion = 0;
	let cachedPdfDoc: PDFDocumentProxy | null = null;
	const controller = new PdfRenderController();

	let pages = $state<PageSpec[]>([]);
	let statusMessage = $state('');
	let isPending = $state(false);
	let pendingVersion = 0;
	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 2.0;
	const ZOOM_STEP = 0.1;

	let zoomFactor = $state(1.0);

	// Only blocks and hiddenBlockIds affect the PDF output
	$effect(() => {
		const blocks = $state.snapshot(cv.blocks);
		const hiddenBlockIds = $state.snapshot(cv.hiddenBlockIds);
		isPending = true;
		const mpv = ++pendingVersion;
		const timer = setTimeout(() => regenerate({ ...cv, blocks, hiddenBlockIds } as CV, mpv), 1000);
		return () => clearTimeout(timer);
	});

	// When zoom changes, re-render from cached doc
	$effect(() => {
		const zoom = zoomFactor;
		if (!cachedPdfDoc) return;
		renderPages(cachedPdfDoc, zoom);
	});

	async function regenerate(snapshot: CV, pv: number) {
		const myVersion = ++generateVersion;

		try {
			const blob = await generatePdfBlob(snapshot);
			if (myVersion !== generateVersion) return;

			const lib = await getPdfjsLib();
			if (myVersion !== generateVersion) return;

			const arrayBuffer = await blob.arrayBuffer();

			if (cachedPdfDoc) {
				cachedPdfDoc.destroy();
				cachedPdfDoc = null;
			}

			const pdfDoc = await lib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
			if (myVersion !== generateVersion) {
				pdfDoc.destroy();
				return;
			}

			cachedPdfDoc = pdfDoc;
			await renderPages(pdfDoc, zoomFactor, pv);
		} catch (err) {
			if (myVersion !== generateVersion) return;
			console.error('PDF preview error:', err);
			isPending = false;
			setMessage('Preview unavailable.');
		}
	}

	async function renderPages(pdfDoc: PDFDocumentProxy, zoom: number, pv?: number) {
		if (!scrollContainer) return;
		const containerWidth = scrollContainer.getBoundingClientRect().width - 32;

		const result = await controller.buildSpecs(pdfDoc, zoom, containerWidth);
		if (!result) return;

		pages = result.specs;
		statusMessage = '';
		await tick();

		await controller.paint(pages, result.version);
		if (pv !== undefined && pv === pendingVersion) isPending = false;
	}

	function setMessage(msg: string) {
		controller.cancelAll();
		pages = [];
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

{#snippet cvSkeletonPage()}
	<div class="shadow-brutal mb-4 box-border w-full bg-white p-8">
		<Skeleton class="bg-muted mb-3 h-8 w-3/4" />
		<Skeleton class="bg-muted mb-6 h-4 w-1/2" />
		<Skeleton class="bg-muted mb-3 h-3 w-1/4" />
		<Skeleton class="bg-muted mb-2 h-4 w-1/2" />
		<Skeleton class="bg-muted mb-1 h-3 w-full" />
		<Skeleton class="bg-muted mb-1 h-3 w-5/6" />
		<Skeleton class="bg-muted mb-6 h-3 w-4/6" />
		<Skeleton class="bg-muted mb-3 h-3 w-1/4" />
		<Skeleton class="bg-muted mb-2 h-4 w-2/3" />
		<Skeleton class="bg-muted mb-1 h-3 w-full" />
		<Skeleton class="bg-muted mb-1 h-3 w-5/6" />
		<Skeleton class="bg-muted mb-6 h-3 w-3/6" />
		<Skeleton class="bg-muted mb-3 h-3 w-1/4" />
		<Skeleton class="bg-muted mb-1 h-3 w-full" />
		<Skeleton class="bg-muted h-3 w-4/6" />
	</div>
{/snippet}

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
			{:else if pages.length === 0}
				{@render cvSkeletonPage()}
			{:else}
				{#each pages as spec (spec.pageNum)}
					<div
						class="animate-in fade-in duration-150"
						style="position:relative; width:{spec.cssWidth}px; height:{spec.cssHeight}px; margin:0 auto 16px; box-shadow:4px 4px 0px 0px var(--shadow-color); background:white; overflow:hidden; flex-shrink:0; opacity:{isPending
							? 0.35
							: 1}; transition:opacity 200ms ease;"
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
						<div class="pdf-page-badge">
							{#if isPending}
								<span class="pdf-spinner"></span>
							{:else}
								{spec.pageNum} / {spec.numPages}
							{/if}
						</div>
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
			min-width: 2rem;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.pdf-spinner {
			display: inline-block;
			width: 10px;
			height: 10px;
			border: 2px solid var(--background);
			border-top-color: transparent;
			border-radius: 50%;
			animation: pdf-spin 0.6s linear infinite;
		}

		@keyframes pdf-spin {
			to {
				transform: rotate(360deg);
			}
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
			font-size: calc(var(--total-scale-factor, 1) * var(--font-height, 0px));
			transform: scaleX(var(--scale-x, 1));
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
