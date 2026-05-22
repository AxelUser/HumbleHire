<script lang="ts">
	import { getCVStoreContext } from '$lib/stores/cv.svelte';
	import { generatePdfBlob } from '$lib/features/export/generate';
	import type * as PDFJSLib from 'pdfjs-dist';

	const cvStore = getCVStoreContext();

	let container: HTMLDivElement;
	let renderVersion = 0;

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

	$effect(() => {
		// FIXME: In reality only blocks and hidden blocks are relevant, not the entire CV. Tracking the entire CV will re-render if e.g. title changes.
		const cv = $state.snapshot(cvStore.cv);

		const timer = setTimeout(async () => {
			if (!cv || !container) return;
			const width = container.getBoundingClientRect().width;
			if (width <= 0) return;
			await renderPages(cv);
		}, 1000);

		return () => clearTimeout(timer);
	});

	async function renderPages(cv: NonNullable<typeof cvStore.cv>) {
		const myVersion = ++renderVersion;

		container.innerHTML =
			'<p class="p-6 text-center text-sm text-muted-foreground">Generating preview…</p>';

		try {
			const blob = await generatePdfBlob(cv);
			if (myVersion !== renderVersion) return;

			const lib = await getPdfjsLib();
			if (myVersion !== renderVersion) return;

			const arrayBuffer = await blob.arrayBuffer();
			const pdfDoc = await lib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
			if (myVersion !== renderVersion) {
				pdfDoc.destroy();
				return;
			}

			container.innerHTML = '';
			const containerWidth = container.getBoundingClientRect().width - 32;

			for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
				if (myVersion !== renderVersion) return;

				const page = await pdfDoc.getPage(pageNum);
				const naturalViewport = page.getViewport({ scale: 1 });
				const scale = containerWidth / naturalViewport.width;
				const viewport = page.getViewport({ scale });

				const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
				const physViewport = page.getViewport({ scale: scale * dpr });

				const wrapper = document.createElement('div');
				wrapper.style.cssText = [
					`position: relative`,
					`width: ${viewport.width}px`,
					`height: ${viewport.height}px`,
					`margin: 0 auto 16px`,
					`box-shadow: 0 1px 6px rgba(0,0,0,0.15)`,
					`background: white`,
					`overflow: hidden`
				].join(';');

				const canvas = document.createElement('canvas');
				canvas.width = Math.floor(physViewport.width);
				canvas.height = Math.floor(physViewport.height);
				canvas.style.width = `${viewport.width}px`;
				canvas.style.height = `${viewport.height}px`;

				const textDiv = document.createElement('div');
				// FIXME: the text div is not well aligned with the canvas. Should figure out a way to use PDF.js's text layer directly.
				textDiv.className = 'pdfTextLayer';
				textDiv.style.cssText = `position:absolute;inset:0;width:${viewport.width}px;height:${viewport.height}px;overflow:hidden`;

				wrapper.appendChild(canvas);
				wrapper.appendChild(textDiv);
				// FIXME: mutating the DOM directly is not ideal, should use Svelte's API instead.
				container.appendChild(wrapper);

				await page.render({ canvas, viewport: physViewport }).promise;

				if (myVersion !== renderVersion) return;

				const textLayer = new lib.TextLayer({
					textContentSource: page.streamTextContent(),
					container: textDiv,
					viewport
				});
				await textLayer.render();
			}
		} catch (err) {
			if (myVersion !== renderVersion) return;
			console.error('PDF preview error:', err);
			if (container) {
				// FIXME: mutating the DOM directly is not ideal, should use Svelte's API instead.
				container.innerHTML =
					'<p class="p-6 text-center text-sm text-muted-foreground">Preview unavailable.</p>';
			}
		}
	}
</script>

<div bind:this={container} class="min-h-full bg-neutral-100 p-4">
	<p class="text-muted-foreground p-6 text-center text-sm">Loading preview…</p>
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
