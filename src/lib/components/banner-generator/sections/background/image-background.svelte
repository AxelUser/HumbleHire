<script lang="ts">
	import { Label } from '@ui/label';
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
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			imageUrl = result;
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
			ctx.globalAlpha = Math.max(0, Math.min(1, imageOpacity / 100));
			ctx.drawImage(imageEl, dx, dy, drawWidth, drawHeight);
			ctx.restore();
		}
		ctx.save();
		ctx.globalCompositeOperation = 'multiply';
		ctx.fillStyle = maskColor;
		ctx.fillRect(0, 0, width, height);
		ctx.restore();
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
		if (imageUrl) loadImageFromUrl(imageUrl);
		onChanged();
	});
</script>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	<div class="space-y-6">
		<div class="space-y-2">
			<Label for="imageUrl">Image URL</Label>
			<Input id="imageUrl" placeholder="https://example.com/image.jpg" bind:value={imageUrl} />
			<div>
				<Label for="imageFile">Upload image</Label>
				<Input
					id="imageFile"
					class="mt-1 block"
					type="file"
					accept="image/*"
					onchange={onFileSelected}
				/>
			</div>
		</div>
		<div class="space-y-2">
			<Label>Image Opacity ({imageOpacity}%)</Label>
			<Slider type="single" bind:value={imageOpacity} min={0} max={100} step={1} />
		</div>
	</div>
	<div class="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
		<div class="space-y-2">
			<Label>Mask color</Label>
			<ColorPicker bind:hex={maskColor} name="maskColor" label="" />
		</div>
		<div class="space-y-2">
			<Label class="text-center">Vertical Position ({imageY}%)</Label>
			<div class="flex items-center justify-center">
				<Slider
					type="single"
					orientation="vertical"
					bind:value={imageY}
					min={0}
					max={100}
					step={1}
				/>
			</div>
		</div>
	</div>
</div>
