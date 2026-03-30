<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { X } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import { createObjectId } from '$lib/types/cv';
	import type { Tag } from '$lib/types/cv';

	interface Props {
		tags: Tag[];
		placeholder?: string;
		class?: string;
	}

	let { tags = $bindable(), placeholder = 'Add a tag...', class: className }: Props = $props();

	let inputValue = $state('');

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

	function onDragOver(event: any) {
		tags = move(tags as any, event) as Tag[];
	}

	function onDragEnd(event: any) {
		tags = move(tags as any, event) as Tag[];
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

<DragDropProvider {onDragEnd} {onDragOver}>
	<div
		class={cn(
			'focus-within:ring-ring/50 flex flex-wrap items-center gap-1.5 rounded-sm border-2 p-1.5 focus-within:ring-[3px]',
			className
		)}
	>
		{#each tags as tag, index (tag.objectId)}
			{@const sortable = createSortable({ id: tag.objectId, index: (() => index) as any })}
			<div
				class={sortable.isDragging ? 'border-muted rounded border-2 border-dashed' : ''}
				{@attach sortable.attach}
			>
				<Badge variant="secondary" class="gap-1 {sortable.isDragging ? 'invisible' : ''}">
					<span {@attach sortable.attachHandle} class="cursor-grab select-none">{tag.value}</span>
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground ml-0.5 cursor-pointer"
						onclick={() => removeTag(index)}
					>
						<X class="h-3 w-3" />
					</button>
				</Badge>
			</div>
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
		{#snippet children(source: any)}
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
