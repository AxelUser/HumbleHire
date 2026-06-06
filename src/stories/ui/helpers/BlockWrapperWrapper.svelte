<script lang="ts">
	import BlockWrapper from '$lib/components/ui/block-wrapper/block-wrapper.svelte';

	const path = 'example/';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	let hidden = $state<string[]>(startVisible ? [] : [path]);
</script>

<BlockWrapper title="Example Section" {path} bind:hidden>
	<p class="text-muted-foreground text-sm">This is the block content.</p>
</BlockWrapper>
