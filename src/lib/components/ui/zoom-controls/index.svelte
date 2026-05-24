<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Minus, Plus } from '@lucide/svelte';
	import type { ZoomMode } from '$lib/types/zoom';

	interface Props {
		effectiveZoom: number;
		mode: ZoomMode;
		canZoomIn: boolean;
		canZoomOut: boolean;
		onZoomIn: () => void;
		onZoomOut: () => void;
		onFitWidth: () => void;
		onFitPage: () => void;
	}

	let {
		effectiveZoom,
		mode,
		canZoomIn,
		canZoomOut,
		onZoomIn,
		onZoomOut,
		onFitWidth,
		onFitPage
	}: Props = $props();

	const displayZoom = $derived(Math.round(effectiveZoom * 100) + '%');
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

	<Button
		variant={mode === 'fit-width' ? 'default' : 'outline'}
		size="sm"
		onclick={onFitWidth}
		aria-pressed={mode === 'fit-width'}
		class="ml-1 select-none">Fit W</Button
	>

	<Button
		variant={mode === 'fit-page' ? 'default' : 'outline'}
		size="sm"
		onclick={onFitPage}
		aria-pressed={mode === 'fit-page'}
		class="select-none">Fit Page</Button
	>
</div>
