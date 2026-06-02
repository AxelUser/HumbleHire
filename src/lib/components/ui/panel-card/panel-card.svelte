<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		title?: string;
		titleSlot?: Snippet;
		action?: Snippet;
		children: Snippet;
		class?: string;
		headerClass?: string;
		contentClass?: string;
		testid?: string;
	}

	let {
		title,
		titleSlot,
		action,
		children,
		class: className,
		headerClass,
		contentClass,
		testid
	}: Props = $props();

	const hasHeader = $derived(title !== undefined || titleSlot !== undefined);
</script>

<div class={cn('border-foreground bg-card shadow-brutal border-2', className)} data-testid={testid}>
	{#if hasHeader}
		<div
			class={cn(
				'border-foreground flex items-center justify-between border-b-2 px-4 py-2',
				headerClass
			)}
		>
			{#if titleSlot}
				{@render titleSlot()}
			{:else}
				<span class="text-foreground text-xs font-bold tracking-widest uppercase">{title}</span>
			{/if}
			{#if action}
				{@render action()}
			{/if}
		</div>
	{/if}
	<div class={cn('px-4 py-4', contentClass)}>
		{@render children()}
	</div>
</div>
