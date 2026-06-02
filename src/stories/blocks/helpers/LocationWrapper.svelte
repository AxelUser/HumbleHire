<script lang="ts">
	import TextBlock from '$lib/components/blocks/text-block.svelte';
	import { createObjectId, type ObjectId, type Block } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	let block = $state<Block<string>>({
		objectId: createObjectId(),
		value: 'San Francisco, CA (open to remote)'
	});
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [block.objectId]);
</script>

<TextBlock bind:block bind:hiddenBlockIds title="Location" placeholder="City, Country" />
