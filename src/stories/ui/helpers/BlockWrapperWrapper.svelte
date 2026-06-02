<script lang="ts">
	import BlockWrapper from '$lib/components/ui/block-wrapper/block-wrapper.svelte';
	import { createObjectId, type ObjectId } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	const blockId = createObjectId();
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [blockId]);
</script>

<BlockWrapper title="Example Section" {blockId} bind:hiddenBlockIds>
	<p class="text-muted-foreground text-sm">This is the block content.</p>
</BlockWrapper>
