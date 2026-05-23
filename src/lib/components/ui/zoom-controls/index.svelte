<script lang="ts">
	interface Props {
		zoomFactor: number;
		onZoomIn: () => void;
		onZoomOut: () => void;
		onFitToScreen: () => void;
		minZoom?: number;
		maxZoom?: number;
	}

	let {
		zoomFactor,
		onZoomIn,
		onZoomOut,
		onFitToScreen,
		minZoom = 0.5,
		maxZoom = 2.0
	}: Props = $props();

	const displayZoom = $derived(Math.round(zoomFactor * 100) + '%');
	const canZoomOut = $derived(zoomFactor > minZoom);
	const canZoomIn = $derived(zoomFactor < maxZoom);
</script>

<div class="flex items-center gap-1">
	<button
		onclick={onZoomOut}
		disabled={!canZoomOut}
		class="border-foreground hover-brutal shadow-brutal-sm flex h-7 w-7 items-center justify-center border-2 font-bold transition-opacity disabled:pointer-events-none disabled:opacity-40"
		aria-label="Zoom out"
	>
		−
	</button>

	<span
		class="border-foreground bg-background flex h-7 min-w-[3.5rem] items-center justify-center border-2 text-xs font-bold tabular-nums"
	>
		{displayZoom}
	</span>

	<button
		onclick={onZoomIn}
		disabled={!canZoomIn}
		class="border-foreground hover-brutal shadow-brutal-sm flex h-7 w-7 items-center justify-center border-2 font-bold transition-opacity disabled:pointer-events-none disabled:opacity-40"
		aria-label="Zoom in"
	>
		+
	</button>

	<button
		onclick={onFitToScreen}
		class="border-foreground hover-brutal shadow-brutal-sm ml-1 flex h-7 items-center justify-center border-2 px-2 text-xs font-bold"
	>
		Fit
	</button>
</div>
