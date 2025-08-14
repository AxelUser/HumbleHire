<script lang="ts">
	import './banner.css';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
	import TechBanner from '$lib/features/banner-generator/themes/tech-banner.svelte';
	import { Button } from '@ui/button';
	import { SEO } from '@shared/seo';
	let canvasEl: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;

	// LinkedIn banner recommended size
	const WIDTH = 1584;
	const HEIGHT = 396;

	onMount(() => {
		if (canvasEl) {
			canvasEl.width = WIDTH;
			canvasEl.height = HEIGHT;
			const context = canvasEl.getContext('2d');
			if (context) {
				ctx = context;
			}
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

<SEO title="Banner Generator" description="Generate a banner for your LinkedIn profile" />

<section class="mx-auto max-w-5xl space-y-4">
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
				<TechBanner {ctx} width={WIDTH} height={HEIGHT} />
			{/if}
		</CardContent>
	</Card>
</section>

<style>
	:global(canvas) {
		image-rendering: optimizeQuality;
	}
	@media (min-width: 768px) {
		section {
			display: grid;
			grid-template-columns: 1fr;
		}
	}
</style>
