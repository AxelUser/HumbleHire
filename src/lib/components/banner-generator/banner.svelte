<script lang="ts">
	import './banner.css';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
	import { Button } from '@ui/button';
	import { LoadingOverlay } from '@shared/loading-overlay';
	import BannerSettings from './banner-settings.svelte';
	import { loadAppFonts } from './fonts';
	let canvasEl: HTMLCanvasElement | null = null;
	let ctx = $state<CanvasRenderingContext2D | null>(null);

	interface Props {
		skillsIcons: { id: string; texts: string[]; url: string }[];
	}

	let { skillsIcons }: Props = $props();

	// LinkedIn banner recommended size
	const WIDTH = 1584;
	const HEIGHT = 396;

	let fontsLoading = $state(true);

	onMount(async () => {
		if (canvasEl) {
			canvasEl.width = WIDTH;
			canvasEl.height = HEIGHT;
			const context = canvasEl.getContext('2d');
			if (context) {
				ctx = context;
			}
		}

		try {
			if (typeof document !== 'undefined' && (document as any).fonts) {
				await loadAppFonts();
			}
		} finally {
			fontsLoading = false;
		}
	});

	function downloadPng() {
		if (!canvasEl) return;
		const url = canvasEl.toDataURL('image/png');
		const a = document.createElement('a');
		a.href = url;
		a.download = `banner-${new Date().toISOString()}.png`;
		a.click();
	}
</script>

<LoadingOverlay bind:open={fontsLoading} label="Loading fonts…" />

<div class="mx-auto grid max-w-5xl grid-cols-1">
	<Card>
		<CardHeader>
			<CardTitle>Banner Preview</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3">
			<div class="bg-background w-full overflow-auto rounded border p-2">
				<canvas bind:this={canvasEl} class="mx-auto block h-auto w-full max-w-full"></canvas>
			</div>
			<div class="flex justify-end">
				<Button onclick={downloadPng}>Download PNG</Button>
			</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Settings</CardTitle>
		</CardHeader>
		<CardContent>
			{#if ctx}
				<BannerSettings {ctx} width={WIDTH} height={HEIGHT} {skillsIcons} />
			{/if}
		</CardContent>
	</Card>
</div>

<style>
	:global(canvas) {
		image-rendering: optimizeQuality;
	}
</style>
