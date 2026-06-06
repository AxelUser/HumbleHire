<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { X } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { SortableItem, createSortableDragHandlers } from '$lib/components/ui/sortable';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import type { Draggable } from '@dnd-kit/dom';
	import { createObjectId, type StringEntry } from '$lib/types/cv';

	interface Props {
		tags: StringEntry[];
		placeholder?: string;
		class?: string;
	}

	let { tags = $bindable(), placeholder = 'Add a tag...', class: className }: Props = $props();

	let inputValue = $state('');

	const drag = createSortableDragHandlers(
		() => tags,
		(next) => {
			tags = next;
		}
	);

	function addTags(raw: string) {
		const newValues = raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (newValues.length > 0) {
			tags = [...tags, ...newValues.map((value) => ({ objectId: createObjectId(), value }))];
		}
		inputValue = '';
	}

	function removeTag(index: number) {
		tags = tags.filter((_, i) => i !== index);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addTags(inputValue);
		} else if (event.key === ',') {
			event.preventDefault();
			addTags(inputValue);
		}
	}

	function handleBlur() {
		if (inputValue.trim()) {
			addTags(inputValue);
		}
	}
</script>

<DragDropProvider {...drag}>
	<div
		class={cn(
			'focus-within:ring-ring/50 flex flex-wrap items-center gap-1.5 rounded-sm border-2 p-1.5 focus-within:ring-[3px]',
			className
		)}
	>
		{#each tags as tag, index (tag.objectId)}
			<SortableItem id={tag.objectId} {index} borderWhenIdle={false}>
				{#snippet children({ attachHandle, isDragging })}
					<Badge variant="secondary" class="gap-1 {isDragging ? 'invisible' : ''}">
						<span {@attach attachHandle} class="cursor-grab select-none">{tag.value}</span>
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground ml-0.5 cursor-pointer"
							onclick={() => removeTag(index)}
						>
							<X class="h-3 w-3" />
						</button>
					</Badge>
				{/snippet}
			</SortableItem>
		{/each}
		<input
			type="text"
			bind:value={inputValue}
			{placeholder}
			class="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
			onkeydown={handleKeydown}
			onblur={handleBlur}
		/>
	</div>
	<DragOverlay>
		{#snippet children(source: Draggable)}
			{@const tag = tags.find((t) => t.objectId === source.id)}
			{#if tag}
				<Badge variant="secondary" class="gap-1 shadow-lg">
					<span>{tag.value}</span>
					<X class="h-3 w-3" />
				</Badge>
			{/if}
		{/snippet}
	</DragOverlay>
</DragDropProvider>
