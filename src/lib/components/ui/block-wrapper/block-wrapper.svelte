<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Eye, EyeOff } from '@lucide/svelte';
	import { PanelCard } from '$lib/components/ui/panel-card';

	interface Props {
		title: string;
		visible: boolean;
		children: Snippet;
	}

	let { title, visible = $bindable(), children }: Props = $props();
</script>

<PanelCard {title}>
	{#snippet action()}
		<button
			type="button"
			onclick={() => (visible = !visible)}
			class="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
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
		<p class="py-2 text-xs italic text-muted-foreground">Section hidden</p>
	{/if}
</PanelCard>
