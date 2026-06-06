<script lang="ts">
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { Button } from '$lib/components/ui/button';
	import { SortableItem, createSortableDragHandlers } from '$lib/components/ui/sortable';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import type { Draggable } from '@dnd-kit/dom';
	import { createObjectId, type ObjectId } from '$lib/types/cv';

	interface ListItem {
		objectId: ObjectId;
		value: string;
	}

	interface Props {
		items: ListItem[];
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

	const drag = createSortableDragHandlers(
		() => items,
		(next) => {
			items = next;
		}
	);

	function addItem() {
		items = [...items, { objectId: createObjectId(), value: '' }];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}
</script>

<DragDropProvider {...drag}>
	<div class={cn('flex flex-col', className)}>
		<div class="flex flex-col gap-1.5">
			{#each items as item, index (item.objectId)}
				<SortableItem
					id={item.objectId}
					{index}
					class="flex items-center gap-2 rounded"
					borderWhenIdle={false}
				>
					{#snippet children({ attachHandle, isDragging })}
						<div class="flex flex-1 items-center gap-2 {isDragging ? 'invisible' : ''}">
							<span class="text-muted-foreground cursor-grab select-none" {@attach attachHandle}>
								<GripVertical class="size-4" />
							</span>
							<InlineTextarea
								bind:value={items[index].value}
								{placeholder}
								class="flex-1"
								rows={2}
							/>
							<Button
								variant="ghost"
								size="icon"
								class="text-muted-foreground hover:text-destructive -mt-1 shrink-0"
								onclick={() => removeItem(index)}
							>
								<Trash2 class="size-4" />
							</Button>
						</div>
					{/snippet}
				</SortableItem>
			{/each}
		</div>
		<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addItem}>
			<Plus class="mr-1 size-4" />
			{addLabel}
		</Button>
	</div>
	<DragOverlay>
		{#snippet children(source: Draggable)}
			{@const item = items.find((i) => i.objectId === source.id)}
			{#if item}
				<div class="bg-background flex items-center gap-2 rounded px-1 py-1 shadow-lg">
					<GripVertical class="text-muted-foreground size-4 shrink-0" />
					<span class="flex-1 text-sm">{item.value || placeholder}</span>
				</div>
			{/if}
		{/snippet}
	</DragOverlay>
</DragDropProvider>
