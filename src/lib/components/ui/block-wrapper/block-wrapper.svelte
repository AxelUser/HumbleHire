<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Eye, EyeOff } from '@lucide/svelte';
	import { PanelCard } from '$lib/components/ui/panel-card';
	import type { ObjectId } from '$lib/types/cv';

	interface Props {
		title: string;
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
		children: Snippet;
	}

	let { title, blockId, hiddenBlockIds = $bindable(), children }: Props = $props();

	const visible = $derived(!hiddenBlockIds.includes(blockId));

	function toggle() {
		if (visible) {
			hiddenBlockIds = [...hiddenBlockIds, blockId];
		} else {
			hiddenBlockIds = hiddenBlockIds.filter((id) => id !== blockId);
		}
	}
</script>

<PanelCard {title}>
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
