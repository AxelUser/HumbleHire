<script lang="ts">
	import { onMount } from 'svelte';
	import { Label } from '@ui/label';
	import { Slider } from '@ui/slider';
	import { buttonVariants } from '@ui/button';
	import * as Select from '@ui/select';

	let { ctx, width, height } = $props<{
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
	}>();

	type ColorMode = 'Solid' | 'Gradient';
	let colorMode: ColorMode = $state('Solid');

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
			<Label for="mode">Color Type</Label>
			<Select.Root type="single" bind:value={colorMode}>
				<Select.Trigger
					data-placeholder="Select a color type"
					class="bg-background w-full rounded-md border px-3 py-2"
				>
					{colorMode}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="Solid" label="Solid" />
					<Select.Item value="Gradient" label="Gradient" />
				</Select.Content>
			</Select.Root>
		</div>

		{#if colorMode === 'Solid'}
			<div class="space-y-2">
				<Label for="solid">Color</Label>
				<input
					id="solid"
					class="bg-background h-9 w-full rounded-md border px-3 py-2"
					type="color"
					bind:value={solidColor}
				/>
			</div>
		{:else}
			<div class="space-y-2">
				<Label for="from">From</Label>
				<input
					id="from"
					class="bg-background h-9 w-full rounded-md border px-3 py-2"
					type="color"
					bind:value={gradientFrom}
				/>
			</div>
			<div class="space-y-2">
				<Label for="to">To</Label>
				<input
					id="to"
					class="bg-background h-9 w-full rounded-md border px-3 py-2"
					type="color"
					bind:value={gradientTo}
				/>
			</div>
			<div class="space-y-2">
				<Label>Angle ({gradientAngle}°)</Label>
				<Slider type="single" bind:value={gradientAngleValue} min={0} max={360} step={1} />
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<Label for="title">Title</Label>
			<input
				id="title"
				class="bg-background h-9 w-full rounded-md border px-3 py-2"
				placeholder="e.g. your name"
				bind:value={title}
			/>
		</div>
		<div class="space-y-2">
			<Label for="titleColor">Title Color</Label>
			<input
				id="titleColor"
				class="bg-background h-9 w-full rounded-md border px-3 py-2"
				type="color"
				bind:value={titleColor}
			/>
		</div>
		<div class="space-y-2">
			<Label for="titleSize">Title Size</Label>
			<input
				id="titleSize"
				class="bg-background h-9 w-full rounded-md border px-3 py-2"
				type="number"
				min="10"
				max="200"
				bind:value={titleSize}
			/>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<Label for="subtitle">Subtitle</Label>
			<input
				id="subtitle"
				class="bg-background h-9 w-full rounded-md border px-3 py-2"
				placeholder="e.g. you role"
				bind:value={subtitle}
			/>
		</div>
		<div class="space-y-2">
			<Label for="subtitleColor">Subtitle Color</Label>
			<input
				id="subtitleColor"
				class="bg-background h-9 w-full rounded-md border px-3 py-2"
				type="color"
				bind:value={subtitleColor}
			/>
		</div>
		<div class="space-y-2">
			<Label for="subtitleSize">Subtitle Size</Label>
			<input
				id="subtitleSize"
				class="bg-background h-9 w-full rounded-md border px-3 py-2"
				type="number"
				min="8"
				max="180"
				bind:value={subtitleSize}
			/>
		</div>
	</div>

	<div class="space-y-2">
		<Label for="icons">Tech Icons</Label>
		<input
			id="icons"
			class="bg-background h-9 w-full rounded-md border px-3 py-2"
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
