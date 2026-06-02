<script lang="ts" module>
	import { setContext } from 'svelte';

	export const SEGMENTED_CONTROL_CTX = Symbol('segmented-control');

	export type SegmentedControlCtx = {
		readonly value: unknown;
		select: (v: unknown) => void;
	};
</script>

<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable<unknown>(),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		value?: unknown;
	} = $props();

	setContext<SegmentedControlCtx>(SEGMENTED_CONTROL_CTX, {
		get value() {
			return value;
		},
		select(v) {
			value = v;
		}
	});
</script>

<div
	bind:this={ref}
	class={cn('border-foreground bg-card shadow-brutal-sm inline-flex border-2', className)}
	{...restProps}
>
	{@render children?.()}
</div>
