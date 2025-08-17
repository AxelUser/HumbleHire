<script lang="ts">
	import { Label } from '@ui/label';
	import * as Select from '@ui/select';
	import { Button } from '@ui/button';
	import { UploadIcon } from '@lucide/svelte';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { Slider } from '@ui/slider';
	import Input from '@ui/input/input.svelte';
	import { onMount } from 'svelte';
	import type { Observable } from 'rxjs';

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		redraw$: Observable<unknown>;
		onChanged: () => void;
	}

	let { ctx, width, height, redraw$, onChanged }: Props = $props();

	let imageUrl = $state('');
	let imageOpacity = $state(100);
	let maskColor = $state('#ffffff');
	let imageY = $state(50);
	let imageEl = $state<HTMLImageElement | null>(null);
	let fileInputEl: HTMLInputElement | null = null;

	type EffectMode = 'None' | 'ColorOverlay' | 'Blur';

	const effectOptions = new Map<EffectMode, string>([
		['None', 'None'],
		['ColorOverlay', 'Color overlay'],
		['Blur', 'Blur']
	]);

	let effectMode: EffectMode = $state('None');
	let blurPx = $state(0);

	function loadImageFromUrl(url: string) {
		if (!url) {
			imageEl = null;
			onChanged();
			return;
		}
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			imageEl = img;
			onChanged();
		};
		img.onerror = () => {
			imageEl = null;
			onChanged();
		};
		img.src = url;
	}

	function onFileSelected(e: Event) {
		imageUrl = '';
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			loadImageFromUrl(result);
		};
		reader.readAsDataURL(file);
	}

	function renderImage() {
		if (!ctx) return;
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, width, height);
		if (imageEl && imageEl.complete && imageEl.naturalWidth > 0) {
			const iw = imageEl.naturalWidth;
			const ih = imageEl.naturalHeight;
			const canvasRatio = width / height;
			const imageRatio = iw / ih;
			let drawWidth = width;
			let drawHeight = height;
			if (imageRatio > canvasRatio) {
				drawHeight = height;
				drawWidth = (iw / ih) * drawHeight;
			} else {
				drawWidth = width;
				drawHeight = (ih / iw) * drawWidth;
			}
			const dx = (width - drawWidth) / 2;
			const dyMin = height - drawHeight;
			const dyMax = 0;
			const t = Math.max(0, Math.min(1, imageY / 100));
			let dy = dyMin + t * (dyMax - dyMin);
			dy = Math.max(dyMin, Math.min(dyMax, dy));
			ctx.save();
			if (effectMode === 'Blur') {
				ctx.filter = `blur(${blurPx}px)`;
			}
			ctx.globalAlpha = Math.max(0, Math.min(1, imageOpacity / 100));
			ctx.drawImage(imageEl, dx, dy, drawWidth, drawHeight);
			ctx.restore();
		}
		if (effectMode === 'ColorOverlay') {
			ctx.save();
			ctx.globalCompositeOperation = 'multiply';
			ctx.fillStyle = maskColor;
			ctx.fillRect(0, 0, width, height);
			ctx.restore();
		}
	}

	onMount(() => {
		const sub = redraw$.subscribe(renderImage);
		onChanged();
		return () => sub.unsubscribe();
	});

	$effect(() => {
		imageUrl;
		imageOpacity;
		maskColor;
		imageY;
		width;
		height;
		effectMode;
		blurPx;
		if (imageUrl) loadImageFromUrl(imageUrl);
		onChanged();
	});
</script>

<div class="grid grid-cols-1 gap-6">
	<div class="space-y-6">
		<div class="space-y-2">
			<Label for="imageUrl">Image URL</Label>
			<Input id="imageUrl" placeholder="https://example.com/image.jpg" bind:value={imageUrl} />
			<div class="text-muted-foreground text-sm">You can upload an image or enter a URL.</div>
			<input
				id="imageFile"
				class="hidden"
				type="file"
				accept="image/*"
				bind:this={fileInputEl}
				onchange={onFileSelected}
			/>
			<Button type="button" onclick={() => fileInputEl?.click()}><UploadIcon /> Upload image</Button
			>
		</div>
		<div class="space-y-4">
			<Label>Image Opacity ({imageOpacity}%)</Label>
			<Slider type="single" bind:value={imageOpacity} min={0} max={100} step={1} />
		</div>
		<div class="space-y-4">
			<Label>Vertical Position ({imageY}%)</Label>
			<Slider type="single" bind:value={imageY} min={0} max={100} step={1} />
		</div>
	</div>
</div>

<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="space-y-2">
		<Label for="effects">Image Effects</Label>
		<Select.Root type="single" bind:value={effectMode}>
			<Select.Trigger data-placeholder="Select an effect" class="w-fit rounded-md border px-3 py-2">
				{effectOptions.get(effectMode)}
			</Select.Trigger>
			<Select.Content>
				{#each effectOptions.entries() as [value, label]}
					<Select.Item {value} {label} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if effectMode === 'ColorOverlay'}
		<div class="space-y-2">
			<Label>Overlay color</Label>
			<ColorPicker bind:hex={maskColor} name="maskColor" label="" />
		</div>
	{:else if effectMode === 'Blur'}
		<div class="space-y-6">
			<Label>Blur ({blurPx}px)</Label>
			<Slider type="single" bind:value={blurPx} min={0} max={40} step={1} />
		</div>
	{/if}
</div>
