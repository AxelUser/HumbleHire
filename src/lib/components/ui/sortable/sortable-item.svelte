<script lang="ts">
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	export type SortableItemHandle = {
		attachHandle: (node: HTMLElement) => () => void;
		isDragging: boolean;
	};

	interface Props {
		id: string;
		index: number;
		class?: string;
		/** Applied to the root when idle (not dragging), in addition to the default border. */
		idleClass?: string;
		borderWhenIdle?: boolean;
		children: Snippet<[SortableItemHandle]>;
		'data-testid'?: string;
	}

	let {
		id,
		index,
		class: className,
		idleClass,
		borderWhenIdle = true,
		children,
		'data-testid': testid
	}: Props = $props();

	const sortable = createSortable({
		get id() {
			return id;
		},
		get index() {
			return index;
		}
	});
</script>

<div
	class={cn(
		className,
		sortable.isDragging
			? 'border-muted border-2 border-dashed'
			: cn(borderWhenIdle && 'border', idleClass)
	)}
	data-testid={testid}
	{@attach sortable.attach}
>
	{@render children({
		attachHandle: sortable.attachHandle,
		isDragging: sortable.isDragging
	})}
</div>
