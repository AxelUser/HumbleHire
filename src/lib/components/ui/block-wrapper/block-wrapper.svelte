<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Eye, EyeOff } from '@lucide/svelte';
	import { PanelCard } from '$lib/components/ui/panel-card';

	interface Props {
		title: string;
		/** The canonical hide marker for this block, e.g. "work/" or "basics/location/". */
		path: string;
		hidden: string[];
		children: Snippet;
	}

	let { title, path, hidden = $bindable(), children }: Props = $props();

	const visible = $derived(!hidden.includes(path));

	function toggle() {
		hidden = visible ? [...hidden, path] : hidden.filter((p) => p !== path);
	}
</script>

<PanelCard {title} testid="block-{title.toLowerCase().replace(/\s+/g, '-')}">
	{#snippet action()}
		<button
			type="button"
			onclick={toggle}
			class="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
			aria-label={visible ? 'Hide section' : 'Show section'}
		>
			{#if visible}
				<Eye class="h-4 w-4" />
			{:else}
				<EyeOff class="h-4 w-4" />
			{/if}
		</button>
	{/snippet}
	{#if visible}
		{@render children()}
	{:else}
		<p class="text-muted-foreground py-2 text-xs italic">Section hidden</p>
	{/if}
</PanelCard>
