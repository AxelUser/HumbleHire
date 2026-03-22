<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { X } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';

	interface Props {
		tags: string[];
		placeholder?: string;
		class?: string;
	}

	let { tags = $bindable(), placeholder = 'Add a tag...', class: className }: Props = $props();

	let inputValue = $state('');
	let nextId = 0;
	let ids = $state<number[]>(tags.map(() => nextId++));

	$effect(() => {
		if (ids.length !== tags.length) {
			ids = tags.map(() => nextId++);
		}
	});

	function addTags(raw: string) {
		const newTags = raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (newTags.length > 0) {
			ids = [...ids, ...newTags.map(() => nextId++)];
			tags = [...tags, ...newTags];
		}
		inputValue = '';
	}

	function removeTag(index: number) {
		ids = ids.filter((_, i) => i !== index);
		tags = tags.filter((_, i) => i !== index);
	}

	function onDragOver(event: any) {
		const idToItem = Object.fromEntries(ids.map((id, i) => [id, tags[i]]));
		ids = move(ids, event);
		tags = ids.map((id) => idToItem[id]);
	}

	function onDragEnd(event: any) {
		const idToItem = Object.fromEntries(ids.map((id, i) => [id, tags[i]]));
		ids = move(ids, event);
		tags = ids.map((id) => idToItem[id]);
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
		{#each tags as tag, index (ids[index])}
			{@const sortable = createSortable({ id: ids[index], index })}
			<div
				class={sortable.isDragging ? 'border-muted rounded border-2 border-dashed' : ''}
				{@attach sortable.attach}
			>
				<Badge variant="secondary" class="gap-1 {sortable.isDragging ? 'invisible' : ''}">
					<span {@attach sortable.attachHandle} class="cursor-grab select-none">{tag}</span>
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
			{@const idx = ids.indexOf(source.id)}
			{#if idx !== -1}
				<Badge variant="secondary" class="gap-1 shadow-lg">
					<span>{tags[idx]}</span>
					<X class="h-3 w-3" />
				</Badge>
			{/if}
		{/snippet}
	</DragOverlay>
</DragDropProvider>
