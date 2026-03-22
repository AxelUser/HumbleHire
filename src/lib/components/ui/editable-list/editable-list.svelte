<script lang="ts">
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';

	interface Props {
		items: string[];
		placeholder?: string;
		addLabel?: string;
		class?: string;
	}

	let {
		items = $bindable(),
		placeholder = 'Add an item...',
		addLabel = 'Add Item',
		class: className
	}: Props = $props();

	let nextId = 0;
	let ids = $state<number[]>(items.map(() => nextId++));

	$effect(() => {
		if (ids.length !== items.length) {
			ids = items.map(() => nextId++);
		}
	});

	function addItem() {
		ids = [...ids, nextId++];
		items = [...items, ''];
	}

	function removeItem(index: number) {
		ids = ids.filter((_, i) => i !== index);
		items = items.filter((_, i) => i !== index);
	}

	function onDragOver(event: any) {
		const idToItem = Object.fromEntries(ids.map((id, i) => [id, items[i]]));
		ids = move(ids, event);
		items = ids.map((id) => idToItem[id]);
	}

	function onDragEnd(event: any) {
		const idToItem = Object.fromEntries(ids.map((id, i) => [id, items[i]]));
		ids = move(ids, event);
		items = ids.map((id) => idToItem[id]);
	}
</script>

<DragDropProvider {onDragEnd} {onDragOver}>
	<div class={cn('flex flex-col', className)}>
		<div class="flex flex-col gap-1.5">
			{#each items as _, index (ids[index])}
				{@const sortable = createSortable({ id: ids[index], index })}
				<div
					class="flex items-center gap-2 {sortable.isDragging
						? 'border-muted rounded border-2 border-dashed'
						: ''}"
					{@attach sortable.attach}
				>
					<div class="flex flex-1 items-center gap-2 {sortable.isDragging ? 'invisible' : ''}">
						<span
							class="text-muted-foreground cursor-grab select-none"
							{@attach sortable.attachHandle}
						>
							<GripVertical class="size-4" />
						</span>
						<InlineTextarea bind:value={items[index]} {placeholder} class="flex-1" rows={2} />
						<Button
							variant="ghost"
							size="icon"
							class="text-muted-foreground hover:text-destructive -mt-1 shrink-0"
							onclick={() => removeItem(index)}
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
		<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addItem}>
			<Plus class="mr-1 size-4" />
			{addLabel}
		</Button>
	</div>
	<DragOverlay>
		{#snippet children(source: any)}
			{@const idx = ids.indexOf(source.id)}
			{#if idx !== -1}
				<div class="bg-background flex items-center gap-2 rounded px-1 py-1 shadow-lg">
					<GripVertical class="text-muted-foreground size-4 shrink-0" />
					<span class="flex-1 text-sm">{items[idx] || placeholder}</span>
				</div>
			{/if}
		{/snippet}
	</DragOverlay>
</DragDropProvider>
