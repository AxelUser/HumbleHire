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
	<div class={cn('flex flex-col gap-1.5', className)}>
		{#each items as _, index (ids[index])}
			{@const sortable = createSortable({ id: ids[index], index: (() => index) as any })}
			<div
				class="flex items-center gap-2 {sortable.isDragging
					? 'border-2 border-dashed border-muted rounded'
					: ''}"
				{@attach sortable.attach}
			>
				<div class="flex items-center gap-2 flex-1 {sortable.isDragging ? 'invisible' : ''}">
					<span
						class="cursor-grab text-muted-foreground select-none"
						{@attach sortable.attachHandle}
					>
						<GripVertical class="size-4" />
					</span>
					<InlineTextarea
						bind:value={items[index]}
						{placeholder}
						class="flex-1"
						rows={2}
					/>
					<Button
						variant="ghost"
						size="icon"
						class="shrink-0 -mt-1 text-muted-foreground hover:text-destructive"
						onclick={() => removeItem(index)}
					>
						<Trash2 class="size-4" />
					</Button>
				</div>
			</div>
		{/each}
		<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addItem}>
			<Plus class="size-4 mr-1" />
			{addLabel}
		</Button>
	</div>
	<DragOverlay>
		{#snippet children(source: any)}
			{@const idx = ids.indexOf(source.id)}
			{#if idx !== -1}
				<div class="flex items-center gap-2 bg-background shadow-lg rounded px-1 py-1">
					<GripVertical class="size-4 shrink-0 text-muted-foreground" />
					<span class="flex-1 text-sm">{items[idx] || placeholder}</span>
				</div>
			{/if}
		{/snippet}
	</DragOverlay>
</DragDropProvider>
