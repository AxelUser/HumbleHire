<script lang="ts">
	import BlockWrapper from '$lib/components/ui/block-wrapper/block-wrapper.svelte';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();
	let visible = $state(startVisible);
</script>

<BlockWrapper title="Example Section" bind:visible>
	<p class="text-sm text-muted-foreground">This is the block content.</p>
</BlockWrapper>
