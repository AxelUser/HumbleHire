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
	}

	let {
		title,
		titleSlot,
		action,
		children,
		class: className,
		headerClass,
		contentClass
	}: Props = $props();

	const hasHeader = $derived(title !== undefined || titleSlot !== undefined);
</script>

<div class={cn('border-2 border-foreground bg-card shadow-brutal', className)}>
	{#if hasHeader}
		<div
			class={cn(
				'flex items-center justify-between border-b-2 border-foreground px-4 py-2',
				headerClass
			)}
		>
			{#if titleSlot}
				{@render titleSlot()}
			{:else}
				<span class="text-xs font-bold uppercase tracking-widest text-foreground">{title}</span>
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
