<script lang="ts">
	import { onMount } from 'svelte';
	import { Label } from '@ui/label';
	import { Button } from '@ui/button';
	import { UploadIcon } from '@lucide/svelte';
	import { IconPicker } from '@shared/icon-picker';
	import { dragAndDrop } from '@formkit/drag-and-drop';
	import { Subject } from 'rxjs';

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		skillsIcons?: { id: string; texts: string[]; url: string }[];
	}

	let { ctx, width, height, skillsIcons = [] }: Props = $props();

	let redraw$ = new Subject<void>();

	import IconsRow from './icons-row.svelte';
	import BackgroundSection from './sections/background-section.svelte';
	import TextSection from './sections/text-section.svelte';

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
		redraw$.next();
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

	function onChanged() {
		scheduleRedraw();
	}

	$effect(() => {
		iconRows;
		width;
		height;
		ctx;
		scheduleRedraw();
	});

	onMount(async () => {
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
	<BackgroundSection {ctx} {width} {height} {redraw$} {onChanged} />

	<TextSection {ctx} {width} {height} {redraw$} {onChanged} />

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
