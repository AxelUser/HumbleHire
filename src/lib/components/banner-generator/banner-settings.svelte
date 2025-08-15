<script lang="ts">
	import { onMount } from 'svelte';
	import { Label } from '@ui/label';
	import { Slider } from '@ui/slider';
	import { Button } from '@ui/button';
	import * as Select from '@ui/select';
	import ColorPicker from 'svelte-awesome-color-picker';
	import Input from '@ui/input/input.svelte';
	import * as ToggleGroup from '@ui/toggle-group';
	import { UploadIcon } from '@lucide/svelte';
	import { IconPicker } from '@shared/icon-picker';
	import { dragAndDrop } from '@formkit/drag-and-drop';

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		skillsIcons?: { id: string; texts: string[]; url: string }[];
	}

	let { ctx, width, height, skillsIcons = [] }: Props = $props();

	type ColorMode = 'Solid' | 'Gradient';
	let colorMode: ColorMode = $state('Solid');
	const colorModeOptions = new Map<ColorMode, string>([
		['Solid', 'Solid color'],
		['Gradient', 'Gradient color']
	]);

	let solidColor = $state('#0ea5e9');
	let gradientFrom = $state('#0ea5e9');
	let gradientTo = $state('#6366f1');
	let gradientAngle = $state(45);

	let title = $state('John Doe');
	let titleWeight = $state<'normal' | 'bold'>('bold');
	let titleStyle = $state<'normal' | 'italic'>('normal');
	let titleToggles = $state<string[]>(['bold']);
	let titleColor = $state('#f9f9f9');
	let titleSize = $state(64);

	let subtitle = $state('Software Engineer');
	let subtitleWeight = $state<'normal' | 'bold'>('normal');
	let subtitleStyle = $state<'normal' | 'italic'>('normal');
	let subtitleToggles = $state<string[]>([]);
	let subtitleColor = $state('#e5e7eb');
	let subtitleSize = $state(32);

	import { loadableFontFamilies, loadAppFonts as loadAppFontsUtil } from './fonts';
	import IconsRow from './icons-row.svelte';

	const genericFontFamilies = ['system-ui', 'serif', 'monospace'] as const;

	type FontFamily = (typeof loadableFontFamilies)[number] | (typeof genericFontFamilies)[number];

	let fontFamily: FontFamily = $state('"JetBrains Mono"');
	const fontOptionsObj = {
		Inter: 'Inter',
		Roboto: 'Roboto',
		Montserrat: 'Montserrat',
		Poppins: 'Poppins',
		'"Playfair Display"': 'Playfair Display',
		Merriweather: 'Merriweather',
		'"JetBrains Mono"': 'JetBrains Mono',
		'system-ui': 'System UI',
		serif: 'Serif',
		monospace: 'Monospace'
	} as const satisfies Record<FontFamily, string>;
	const fontOptions = new Map<FontFamily, string>(
		Object.entries(fontOptionsObj) as [FontFamily, string][]
	);

	type IconItem = { url: string; bmp: ImageBitmap | HTMLImageElement };
	let iconRows = $state<IconItem[][]>([[], []]);
	let rowEl0 = $state<HTMLElement>(null!);
	let rowEl1 = $state<HTMLElement>(null!);
	const totalIcons = $derived(iconRows[0].length + iconRows[1].length);
	const selectedIconUrls = $derived([...iconRows[0], ...iconRows[1]].map((i) => i.url));
	let fileInputEl: HTMLInputElement | null = null;
	const MAX_ICONS = 12;
	const MAX_PER_ROW = 6;
	const CANVAS_PADDING = 48;

	let rafId: number | null = null;
	function scheduleRedraw() {
		if (rafId !== null) return;
		rafId = requestAnimationFrame(() => {
			rafId = null;
			redraw();
		});
	}

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

		const padding = CANVAS_PADDING;
		const titleX = width - padding;
		const titleY = padding;

		ctx.fillStyle = titleColor;
		const titleFontWeight = titleWeight === 'bold' ? '700' : '400';
		ctx.font = `${titleStyle} ${titleFontWeight} ${titleSize}px ${fontFamily}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
		if (title) ctx.fillText(title, titleX, titleY, width * 0.8);

		const subtitleY = titleY + titleSize + 12;
		ctx.fillStyle = subtitleColor;
		const subtitleFontWeight = subtitleWeight === 'bold' ? '700' : '400';
		ctx.font = `${subtitleStyle} ${subtitleFontWeight} ${subtitleSize}px ${fontFamily}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
		if (subtitle) ctx.fillText(subtitle, titleX, subtitleY, width * 0.8);
	}

	function drawIcons() {
		const total = iconRows[0].length + iconRows[1].length;
		if (!ctx || total === 0) return;
		const padding = CANVAS_PADDING;
		const iconSize = 48;
		const gap = 12;

		const nonEmptyRows: IconItem[][] = iconRows.filter((r) => r.length > 0);
		let y = height - padding - nonEmptyRows.length * iconSize - (nonEmptyRows.length - 1) * gap;
		for (const row of nonEmptyRows) {
			let x = width - padding - row.length * iconSize - (row.length - 1) * gap;
			for (let i = 0; i < row.length; i++) {
				const bmp = row[i]?.bmp;
				if (bmp) ctx.drawImage(bmp as any, x, y, iconSize, iconSize);
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

	async function fileToBitmap(file: File, url: string): Promise<ImageBitmap | HTMLImageElement> {
		try {
			return await createImageBitmap(file);
		} catch {
			return await loadImage(url);
		}
	}

	function redraw() {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);
		setBackground();
		drawText();
		drawIcons();
	}

	function firstRowWithCapacity(): number | null {
		for (let i = 0; i < 2; i++) if (iconRows[i].length < MAX_PER_ROW) return i;
		return null;
	}

	function addIcon(url: string, bmp: ImageBitmap | HTMLImageElement) {
		const total = iconRows[0].length + iconRows[1].length;
		if (total >= MAX_ICONS) return;
		const rowIndex = firstRowWithCapacity();
		if (rowIndex === null) return;
		iconRows[rowIndex] = [...iconRows[rowIndex], { url, bmp }];
		scheduleRedraw();
	}

	function selectFromLibrary(item: { id: string; texts: string[]; url: string }) {
		loadImage(item.url).then((img) => {
			addIcon(item.url, img);
		});
	}

	function unselectFromLibrary(item: { id: string; texts: string[]; url: string }) {
		for (let r = 0; r < 2; r++) {
			const idx = iconRows[r].findIndex((it) => it.url === item.url);
			if (idx >= 0) {
				removeIcon(r, idx);
				break;
			}
		}
	}

	async function onFilesSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;
		const total = iconRows[0].length + iconRows[1].length;
		const allowed = Math.max(0, MAX_ICONS - total);
		if (allowed <= 0) {
			input.value = '';
			return;
		}
		const filesToAdd = Array.from(input.files).slice(0, allowed);
		const urlsToAdd = filesToAdd.map((f) => URL.createObjectURL(f));
		const bitmapsToAdd = await Promise.all(filesToAdd.map((f, i) => fileToBitmap(f, urlsToAdd[i])));
		for (let i = 0; i < urlsToAdd.length; i++) addIcon(urlsToAdd[i], bitmapsToAdd[i]);
		input.value = '';
	}

	function removeIcon(rowIndex: number, index: number) {
		const item = iconRows[rowIndex][index];
		iconRows[rowIndex].splice(index, 1);
		if (item?.url && item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
		scheduleRedraw();
	}

	let destroyers: ((() => void) | null)[] = [null, null];

	function initDnDForRow(rowIndex: 0 | 1) {
		const parentEl = rowIndex === 0 ? rowEl0 : rowEl1;
		if (!parentEl) return;
		if (destroyers[rowIndex]) destroyers[rowIndex]!();
		const teardown = dragAndDrop({
			parent: parentEl,
			getValues: () => iconRows[rowIndex],
			setValues: (newValues: IconItem[]) => {
				iconRows[rowIndex] = newValues;
				scheduleRedraw();
			},
			config: {
				group: `icons-row${rowIndex}`,
				sortable: true,
				accepts: () => iconRows[rowIndex].length < MAX_PER_ROW
			}
		});
		destroyers[rowIndex] = typeof teardown === 'function' ? teardown : null;
	}

	$effect(() => {
		titleWeight = titleToggles.includes('bold') ? 'bold' : 'normal';
		titleStyle = titleToggles.includes('italic') ? 'italic' : 'normal';
	});

	$effect(() => {
		subtitleWeight = subtitleToggles.includes('bold') ? 'bold' : 'normal';
		subtitleStyle = subtitleToggles.includes('italic') ? 'italic' : 'normal';
	});

	export async function loadAppFonts(): Promise<void> {
		if (typeof document === 'undefined' || !(document as any).fonts) return;
		const families = [...loadableFontFamilies];
		const styles = ['normal', 'italic'];
		const weights = ['400', '700'];
		await Promise.all(
			families.flatMap((family) =>
				styles.flatMap((style) =>
					weights.map((weight) => (document as any).fonts.load(`${style} ${weight} 1em ${family}`))
				)
			)
		);
		await (document as any).fonts.ready;
	}

	$effect(() => {
		colorMode;
		solidColor;
		gradientFrom;
		gradientTo;
		gradientAngle;
		title;
		titleColor;
		titleSize;
		titleStyle;
		titleWeight;
		subtitle;
		subtitleColor;
		subtitleSize;
		subtitleStyle;
		subtitleWeight;
		fontFamily;
		iconRows;
		width;
		height;
		ctx;
		scheduleRedraw();
	});

	onMount(async () => {
		await loadAppFontsUtil();
		scheduleRedraw();
		initDnDForRow(0);
		initDnDForRow(1);
	});

	$effect(() => {
		rowEl0;
		rowEl1;
		initDnDForRow(0);
		initDnDForRow(1);
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
					<Slider type="single" bind:value={gradientAngle} min={0} max={360} step={1} />
				</div>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<Label for="font">Font</Label>
			<Select.Root type="single" bind:value={fontFamily}>
				<Select.Trigger data-placeholder="Select a font" class="w-fit rounded-md border px-3 py-2">
					{fontOptions.get(fontFamily)}
				</Select.Trigger>
				<Select.Content>
					{#each fontOptions.entries() as [value, label]}
						<Select.Item {value} {label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="flex flex-col space-y-2">
			<Label>Title</Label>
			<div class="flex items-center gap-2">
				<ColorPicker bind:hex={titleColor} name="titleColor" label="Color" />
				<Input id="title" placeholder="e.g. your name" bind:value={title} />
				<ToggleGroup.Root type="multiple" variant="outline" bind:value={titleToggles}>
					<ToggleGroup.Item value="bold" aria-label="Toggle bold">
						<strong>B</strong>
					</ToggleGroup.Item>
					<ToggleGroup.Item value="italic" aria-label="Toggle italic">
						<em>I</em>
					</ToggleGroup.Item>
				</ToggleGroup.Root>
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
				<ToggleGroup.Root type="multiple" variant="outline" bind:value={subtitleToggles}>
					<ToggleGroup.Item value="bold" aria-label="Toggle bold">
						<strong>B</strong>
					</ToggleGroup.Item>
					<ToggleGroup.Item value="italic" aria-label="Toggle italic">
						<em>I</em>
					</ToggleGroup.Item>
				</ToggleGroup.Root>
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
		<input
			id="icons"
			class="hidden"
			type="file"
			accept="image/*"
			multiple
			bind:this={fileInputEl}
			onchange={onFilesSelected}
		/>
		<div class="flex items-center gap-2">
			<Button type="button" onclick={() => fileInputEl?.click()} disabled={totalIcons >= MAX_ICONS}
				><UploadIcon /> Upload icons</Button
			>
			<IconPicker
				items={skillsIcons}
				selectedIds={selectedIconUrls}
				buttonLabel="Pick icons from library"
				onSelected={selectFromLibrary}
				onUnselected={unselectFromLibrary}
			/>
		</div>
	</div>

	{#if totalIcons > 0}
		<div class="space-y-2">
			<div class="text-muted-foreground text-sm">
				Drag to rearrange or move between rows. Max {MAX_PER_ROW} per row.
			</div>
			<div class="space-y-3">
				<IconsRow
					rowIndex={0}
					items={iconRows[0]}
					bind:rowEl={rowEl0}
					{removeIcon}
					maxPerRow={MAX_PER_ROW}
				/>
				<IconsRow
					rowIndex={1}
					items={iconRows[1]}
					bind:rowEl={rowEl1}
					{removeIcon}
					maxPerRow={MAX_PER_ROW}
				/>
			</div>
		</div>
	{/if}
</div>
