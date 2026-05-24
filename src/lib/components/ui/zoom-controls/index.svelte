<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Minus, Plus } from '@lucide/svelte';

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

<div class="flex items-center gap-1 select-none">
	<Button
		variant="outline"
		size="icon-sm"
		onclick={onZoomOut}
		disabled={!canZoomOut}
		class="select-none"
		aria-label="Zoom out"
	>
		<Minus class="h-4 w-4" />
	</Button>

	<span
		class="border-foreground bg-background flex h-8 min-w-[3.5rem] items-center justify-center border-2 text-xs font-bold tabular-nums select-none"
		aria-live="polite"
	>
		{displayZoom}
	</span>

	<Button
		variant="outline"
		size="icon-sm"
		onclick={onZoomIn}
		disabled={!canZoomIn}
		class="select-none"
		aria-label="Zoom in"
	>
		<Plus class="h-4 w-4" />
	</Button>

	<Button variant="outline" size="sm" onclick={onFitToScreen} class="ml-1 select-none">Fit</Button>
</div>
