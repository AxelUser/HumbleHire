<script lang="ts">
	import { Trash2 } from '@lucide/svelte';

	interface Props {
		rowIndex: 0 | 1;
		items: { url: string; bmp: ImageBitmap | HTMLImageElement }[];
		rowEl: HTMLElement;
		removeIcon: (rowIndex: number, idx: number) => void;
		maxPerRow: number;
	}

	let { rowIndex, items, rowEl = $bindable(), removeIcon, maxPerRow }: Props = $props();
</script>

<div class="text-muted-foreground text-xs">
	Row {rowIndex + 1} — {items.length}/{maxPerRow} used
</div>
<div class="flex min-h-12 flex-wrap gap-3" bind:this={rowEl}>
	{#if items.length === 0}
		<div
			class="text-muted-foreground bg-muted flex min-h-12 items-center justify-center rounded p-2 text-xs"
		>
			Move icons here
		</div>
	{/if}
	{#each items as item, idx (item.url)}
		<div class="flex items-center gap-2 rounded p-2" role="listitem">
			<div class="flex items-center">
				<img src={item.url} alt="icon" class="size-10 rounded object-contain" />
				<button
					class="bg-destructive ring-destructive/40 hover:bg-destructive/90 -mr-1 ml-1 inline-flex size-5 items-center justify-center rounded-full text-white shadow ring-1 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
					aria-label="Remove icon"
					onclick={() => removeIcon(rowIndex, idx)}
				>
					<Trash2 class="size-4" />
				</button>
			</div>
		</div>
	{/each}
</div>
