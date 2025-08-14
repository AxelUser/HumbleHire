<script lang="ts">
	import { onMount } from 'svelte';
	import { Label } from '@ui/label';
	import { Slider } from '@ui/slider';
	import { buttonVariants } from '@ui/button';
	import * as Select from '@ui/select';
	import ColorPicker from 'svelte-awesome-color-picker';
	import Input from '@ui/input/input.svelte';

	let { ctx, width, height } = $props<{
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
	}>();

	type ColorMode = 'Solid' | 'Gradient';
	let colorMode: ColorMode = $state('Solid');
	const colorModeOptions = new Map<ColorMode, string>([
		['Solid', 'Solid color'],
		['Gradient', 'Gradient color']
	]);

	let solidColor = $state('#0ea5e9');
	let gradientFrom = $state('#0ea5e9');
	let gradientTo = $state('#6366f1');
	let gradientAngleValue = $state(45);
	const gradientAngle = $derived(gradientAngleValue ?? 0);

	let title = $state('');
	let titleColor = $state('#ffffff');
	let titleSize = $state(64);

	let subtitle = $state('');
	let subtitleColor = $state('#e5e7eb');
	let subtitleSize = $state(32);

	let iconFiles = $state<File[]>([]);
	let iconUrls = $state<string[]>([]);

	function setBackground() {
		if (!ctx) return;
		if (colorMode === 'Solid') {
			ctx.fillStyle = solidColor;
			ctx.fillRect(0, 0, width, height);
		} else {
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
		}
	}

	function drawText() {
		if (!ctx) return;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'right';

		const padding = 48;
		const titleX = width - padding;
		const titleY = padding;

		ctx.fillStyle = titleColor;
		ctx.font = `${titleSize}px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
		if (title) ctx.fillText(title, titleX, titleY, width * 0.8);

		const subtitleY = titleY + titleSize + 12;
		ctx.fillStyle = subtitleColor;
		ctx.font = `${subtitleSize}px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
		if (subtitle) ctx.fillText(subtitle, titleX, subtitleY, width * 0.8);
	}

	function layoutIcons(urls: string[]) {
		const maxPerRow = 6;
		const rows: string[][] = [];
		for (let i = 0; i < urls.length; i += maxPerRow) rows.push(urls.slice(i, i + maxPerRow));
		return rows;
	}

	async function drawIcons() {
		if (!ctx || iconUrls.length === 0) return;
		const padding = 32;
		const areaWidth = Math.min(width * 0.6, 800);
		const areaX = width - padding - areaWidth;
		const iconSize = 48;
		const gap = 12;

		const rows = layoutIcons(iconUrls);
		let y = height - padding - rows.length * iconSize - (rows.length - 1) * gap;
		for (const row of rows) {
			let x = width - padding - row.length * iconSize - (row.length - 1) * gap;
			for (const url of row) {
				const img = await loadImage(url);
				ctx.drawImage(img, x, y, iconSize, iconSize);
				x += iconSize + gap;
			}
			y += iconSize + gap;
		}
	}

	function loadImage(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = url;
		});
	}

	async function redraw() {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);
		setBackground();
		drawText();
		await drawIcons();
	}

	function onFilesSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;
		iconFiles = Array.from(input.files);
		iconUrls = iconFiles.map((f) => URL.createObjectURL(f));
	}

	function removeIcon(index: number) {
		iconFiles.splice(index, 1);
		iconUrls.splice(index, 1);
	}

	let dragIndex: number | null = null;
	function onDragStart(index: number) {
		dragIndex = index;
	}
	function onDrop(index: number) {
		if (dragIndex === null || dragIndex === index) return;
		const [file] = iconFiles.splice(dragIndex, 1);
		const [url] = iconUrls.splice(dragIndex, 1);
		iconFiles.splice(index, 0, file);
		iconUrls.splice(index, 0, url);
		dragIndex = null;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	$effect(() => {
		void redraw();
	});

	onMount(() => {
		void redraw();
	});
</script>

<div class="space-y-6">
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
		{:else}
			<div class="flex flex-wrap items-end gap-4">
				<div class="space-y-2">
					<ColorPicker bind:hex={gradientFrom} name="from" label="From" />
				</div>
				<div class="space-y-2">
					<ColorPicker bind:hex={gradientTo} name="to" label="To" />
				</div>
				<div class="min-w-1/2 space-y-2">
					<Label>Angle ({gradientAngle}°)</Label>
					<Slider type="single" bind:value={gradientAngleValue} min={0} max={360} step={1} />
				</div>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="flex flex-col space-y-2">
			<Label>Title</Label>
			<div class="flex items-center gap-2">
				<ColorPicker bind:hex={titleColor} name="titleColor" label="Color" />
				<Input id="title" placeholder="e.g. your name" bind:value={title} />
			</div>
		</div>
		<div class="space-y-2">
			<Label for="titleSize">Size</Label>
			<Input id="titleSize" class="w-16" type="number" min="10" max="200" bind:value={titleSize} />
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="flex flex-col space-y-2">
			<Label>Subtitle</Label>
			<div class="flex items-center gap-2">
				<ColorPicker bind:hex={subtitleColor} name="subtitleColor" label="Color" />
				<Input id="subtitle" placeholder="e.g. your role" bind:value={subtitle} />
			</div>
		</div>
		<div class="space-y-2">
			<Label for="subtitleSize">Size</Label>
			<Input
				id="subtitleSize"
				class="w-16"
				type="number"
				min="10"
				max="200"
				bind:value={subtitleSize}
			/>
		</div>
	</div>

	<div class="space-y-2">
		<Label for="icons">Icons</Label>
		<Input
			id="icons"
			class="w-96"
			type="file"
			accept="image/*"
			multiple
			onchange={onFilesSelected}
		/>
	</div>

	{#if iconUrls.length > 0}
		<div class="space-y-2">
			<div class="text-muted-foreground text-sm">Drag to reorder. Max 6 icons per row.</div>
			<div class="flex flex-wrap gap-3">
				{#each iconUrls as url, idx}
					<div
						class="relative flex items-center gap-2 rounded border p-2"
						draggable="true"
						role="listitem"
						ondragstart={() => onDragStart(idx)}
						ondrop={() => onDrop(idx)}
						ondragover={handleDragOver}
					>
						<img src={url} alt="icon" class="size-10 rounded object-contain" />
						<button
							class={buttonVariants({ variant: 'destructive', size: 'sm' })}
							onclick={() => removeIcon(idx)}>×</button
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
