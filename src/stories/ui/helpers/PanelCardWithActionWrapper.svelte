<script lang="ts">
	import PanelCard from '$lib/components/ui/panel-card/panel-card.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<PanelCard title="Panel Title" class="w-64">
	{#snippet action()}
		<Button variant="ghost" size="icon-sm">✎</Button>
	{/snippet}
	<p class="text-muted-foreground text-sm">Panel content goes here.</p>
</PanelCard>
