<script lang="ts">
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';
	import CollapsibleTrigger from '$lib/components/ui/collapsible/collapsible-trigger.svelte';
	import CollapsibleContent from '$lib/components/ui/collapsible/collapsible-content.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	interface Props {
		startOpen?: boolean;
	}

	let { startOpen = false }: Props = $props();
	let open = $state(startOpen);
</script>

<Collapsible bind:open class="w-64">
	<div class="flex items-center justify-between gap-4">
		<span class="text-sm font-semibold">Collapsible Section</span>
		<CollapsibleTrigger>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon-sm" {...props}>
					{open ? '▲' : '▼'}
				</Button>
			{/snippet}
		</CollapsibleTrigger>
	</div>
	<CollapsibleContent>
		<p class="mt-2 text-sm text-muted-foreground">Hidden content revealed when open.</p>
	</CollapsibleContent>
</Collapsible>
