<script lang="ts">
	import { tick } from 'svelte';
	import { generatePdfBlob } from '$lib/features/export/generate';
	import { getPdfjsLib } from '$lib/features/export/pdfjs';
	import { PdfRenderController } from '$lib/features/export/render-controller';
	import type { PageSpec } from '$lib/features/export/render-controller';
	import ZoomControls from '$lib/components/ui/zoom-controls/index.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Badge } from '$lib/components/ui/badge';
	import type { PDFDocumentProxy } from 'pdfjs-dist';
	import type { CV } from '$lib/types/cv';
	import { ZOOM_STOPS } from '$lib/types/zoom';
	import type { ZoomState } from '$lib/types/zoom';
	import { watch } from 'runed';

	interface Props {
		cv: CV;
		zoomState: ZoomState;
	}

	let { cv, zoomState = $bindable() }: Props = $props();

	const PDF_PREVIEW_PADDING = 16;

	let scrollContainer: HTMLDivElement;
	let generateVersion = 0;
	let cachedPdfDoc: PDFDocumentProxy | null = null;
	const controller = new PdfRenderController();

	let pages = $state<PageSpec[]>([]);
	let statusMessage = $state('');
	let isPending = $state(false);
	let pendingVersion = 0;
	let naturalPageSize = $state<{ width: number; height: number } | null>(null);

	function computeRenderScale(): number {
		if (!naturalPageSize || !scrollContainer) return zoomState.zoom;
		const cw = scrollContainer.getBoundingClientRect().width - 32;
		if (zoomState.mode === 'fit-width') return cw / naturalPageSize.width;
		if (zoomState.mode === 'fit-page') {
			const ch = scrollContainer.getBoundingClientRect().height - PDF_PREVIEW_PADDING * 3;
			return Math.min(cw / naturalPageSize.width, ch / naturalPageSize.height);
		}
		return zoomState.zoom;
	}

	const effectiveZoom = $derived(computeRenderScale());
	const canZoomIn = $derived(ZOOM_STOPS.some((s) => s > effectiveZoom + 0.001));
	const canZoomOut = $derived(ZOOM_STOPS.some((s) => s < effectiveZoom - 0.001));

	// Only blocks and hiddenBlockIds affect the PDF output
	$effect(() => {
		const blocks = $state.snapshot(cv.blocks);
		const hiddenBlockIds = $state.snapshot(cv.hiddenBlockIds);
		isPending = true;
		const mpv = ++pendingVersion;
		const timer = setTimeout(() => regenerate({ ...cv, blocks, hiddenBlockIds } as CV, mpv), 1000);
		return () => clearTimeout(timer);
	});

	// Re-render when zoom state changes
	watch(
		() => zoomState,
		() => {
			if (!cachedPdfDoc) return;
			renderPages(cachedPdfDoc);
		}
	);

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
			const firstPage = await pdfDoc.getPage(1);
			const nv = firstPage.getViewport({ scale: 1 });
			naturalPageSize = { width: nv.width, height: nv.height };

			await renderPages(pdfDoc, pv);
		} catch (err) {
			if (myVersion !== generateVersion) return;
			console.error('PDF preview error:', err);
			isPending = false;
			cancelAndShowError('Preview unavailable.');
		}
	}

	async function renderPages(pdfDoc: PDFDocumentProxy, pv?: number) {
		if (!scrollContainer) return;
		const scale = effectiveZoom;

		const result = await controller.buildSpecs(pdfDoc, scale);
		if (!result) return;

		pages = result.specs;
		statusMessage = '';
		await tick();

		await controller.paint(pages, result.version);
		if (pv !== undefined && pv === pendingVersion) isPending = false;
	}

	function cancelAndShowError(msg: string) {
		controller.cancelAll();
		pages = [];
		statusMessage = msg;
	}

	function zoomIn() {
		const next = ZOOM_STOPS.find((s) => s > effectiveZoom + 0.001);
		if (next !== undefined) zoomState = { mode: 'custom', zoom: next };
	}

	function zoomOut() {
		const next = [...ZOOM_STOPS].reverse().find((s) => s < effectiveZoom - 0.001);
		if (next !== undefined) zoomState = { mode: 'custom', zoom: next };
	}

	function fitWidth() {
		if (!scrollContainer || !naturalPageSize) return;
		const cw = scrollContainer.getBoundingClientRect().width - 32;
		zoomState = { mode: 'fit-width', zoom: cw / naturalPageSize.width };
	}

	function fitPage() {
		if (!scrollContainer || !naturalPageSize) return;
		const cw = scrollContainer.getBoundingClientRect().width - 32;
		const ch = scrollContainer.getBoundingClientRect().height - PDF_PREVIEW_PADDING * 3;
		zoomState = {
			mode: 'fit-page',
			zoom: Math.min(cw / naturalPageSize.width, ch / naturalPageSize.height)
		};
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
			{effectiveZoom}
			mode={zoomState.mode}
			{canZoomIn}
			{canZoomOut}
			onZoomIn={zoomIn}
			onZoomOut={zoomOut}
			onFitWidth={fitWidth}
			onFitPage={fitPage}
		/>
	</div>

	<!-- Scrollable pages area -->
	<div bind:this={scrollContainer} class="bg-muted flex-1 overflow-auto">
		<div class="min-w-full" style={`padding: ${PDF_PREVIEW_PADDING}px;`}>
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
						<Badge
							class="bg-foreground text-background pointer-events-none absolute top-2 right-2 border-transparent select-none"
						>
							{#if isPending}
								<div>
									<Spinner class="size-4" />
								</div>
							{:else}
								{spec.pageNum} / {spec.numPages}
							{/if}
						</Badge>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	:global {
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
