<script lang="ts">
	import { Label } from '@ui/label';
	import * as Select from '@ui/select';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { Slider } from '@ui/slider';
	import Input from '@ui/input/input.svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { Observable, Subscription } from 'rxjs';

	type ColorMode = 'Solid' | 'Gradient' | 'Image';

	const colorModeOptions = new Map<ColorMode, string>([
		['Solid', 'Solid color'],
		['Gradient', 'Gradient color'],
		['Image', 'Image']
	]);

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		redraw$: Observable<unknown>;
		onChanged: () => void;
	}

	let { ctx, width, height, redraw$, onChanged }: Props = $props();

	let colorMode: ColorMode = $state('Solid');

	let solidColor = $state('#0ea5e9');
	let gradientFrom = $state('#0ea5e9');
	let gradientTo = $state('#6366f1');
	let gradientAngle = $state(45);

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

	export function renderBackground() {
		if (!ctx) return;
		if (colorMode === 'Solid') {
			ctx.fillStyle = solidColor;
			ctx.fillRect(0, 0, width, height);
		} else if (colorMode === 'Gradient') {
			const radians = (gradientAngle * Math.PI) / 180;
			const x = Math.cos(radians);
			const y = Math.sin(radians);
			const cx = width / 2;
			const cy = height / 2;
			const halfDiag = Math.sqrt(cx * cx + cy * cy);
			const x0 = cx - x * halfDiag;
			const y0 = cy - y * halfDiag;
			const x1 = cx + x * halfDiag;
			const y1 = cy + y * halfDiag;
			const grad = ctx.createLinearGradient(x0, y0, x1, y1);
			grad.addColorStop(0, gradientFrom);
			grad.addColorStop(1, gradientTo);
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, width, height);
		} else if (colorMode === 'Image') {
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
	}

	onMount(() => {
		const sub = redraw$.subscribe(renderBackground);

		return () => {
			sub?.unsubscribe();
		};
	});

	$effect(() => {
		colorMode;
		solidColor;
		gradientFrom;
		gradientTo;
		gradientAngle;
		imageUrl;
		imageOpacity;
		maskColor;
		imageY;
		onChanged();
	});

	$effect(() => {
		if (colorMode === 'Image') {
			loadImageFromUrl(imageUrl);
		}
		onChanged();
	});
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="space-y-2">
		<Label for="mode">Background</Label>
		<Select.Root type="single" bind:value={colorMode}>
			<Select.Trigger
				data-placeholder="Select a color type"
				class="w-fit rounded-md border px-3 py-2"
			>
				{colorModeOptions.get(colorMode)}
			</Select.Trigger>
			<Select.Content>
				{#each colorModeOptions.entries() as [value, label]}
					<Select.Item {value} {label} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if colorMode === 'Solid'}
		<div class="mt-auto">
			<ColorPicker bind:hex={solidColor} name="solid" label="Choose a color" />
		</div>
	{:else if colorMode === 'Gradient'}
		<div class="flex flex-wrap items-end gap-4">
			<div class="space-y-2">
				<ColorPicker bind:hex={gradientFrom} name="from" label="From" />
			</div>
			<div class="space-y-2">
				<ColorPicker bind:hex={gradientTo} name="to" label="To" />
			</div>
			<div class="min-w-1/2 space-y-2">
				<Label>Angle ({gradientAngle}°)</Label>
				<Slider type="single" bind:value={gradientAngle} min={0} max={360} step={1} />
			</div>
		</div>
	{:else}
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
	{/if}
</div>
