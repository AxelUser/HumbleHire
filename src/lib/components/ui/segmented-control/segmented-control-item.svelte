<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { SEGMENTED_CONTROL_CTX, type SegmentedControlCtx } from './segmented-control.svelte';

	let {
		value,
		class: className,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, 'value'> & {
		value?: unknown;
	} = $props();

	const ctx = getContext<SegmentedControlCtx>(SEGMENTED_CONTROL_CTX);
	const selected = $derived(ctx.value === value);
</script>

<button
	type="button"
	aria-pressed={selected}
	onclick={() => ctx.select(value)}
	class={cn(
		'item inline-flex h-8 cursor-pointer items-center border-0 px-2.5 text-xs font-bold',
		selected ? 'item--on bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>

<style>
	.item {
		transition:
			background 140ms ease,
			color 140ms ease,
			box-shadow 160ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.item + .item) {
		border-left: 2px solid var(--foreground);
	}

	.item:not(.item--on):hover {
		color: var(--foreground);
		background: color-mix(in oklab, var(--foreground) 7%, transparent);
		box-shadow: inset 3px 3px 0 0 color-mix(in oklab, var(--foreground) 22%, transparent);
	}

	.item:not(.item--on):active {
		background: color-mix(in oklab, var(--foreground) 12%, transparent);
		box-shadow: inset 4px 4px 0 0 color-mix(in oklab, var(--foreground) 32%, transparent);
	}
</style>
