<script lang="ts">
	import type { Snippet } from 'svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	interface Props {
		title: string;
		visible: boolean;
		children: Snippet;
	}

	let { title, visible = $bindable(), children }: Props = $props();
</script>

<div class="flex flex-col gap-2 border-l-4 border-foreground pl-3">
	<div class="flex items-center justify-between">
		<span class="text-sm font-bold uppercase tracking-wide text-foreground">
			{title}
		</span>
		<label class="flex items-center gap-2 cursor-pointer">
			<span class="text-xs text-muted-foreground">Show section</span>
			<Switch bind:checked={visible} />
		</label>
	</div>
	<Separator />
	{#if visible}
		{@render children()}
	{:else}
		<p class="text-xs text-muted-foreground italic py-2">Section hidden</p>
	{/if}
</div>
