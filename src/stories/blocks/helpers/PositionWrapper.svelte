<script lang="ts">
	import TextBlock from '$lib/components/blocks/text-block.svelte';
	import { createObjectId } from '$lib/types/cv';
	import type { ObjectId, TextBlock as TextBlockData } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	let block = $state<TextBlockData>({
		objectId: createObjectId(),
		value: 'Senior Software Engineer'
	});
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [block.objectId]);
</script>

<TextBlock
	bind:block
	bind:hiddenBlockIds
	title="Position"
	placeholder="Your position / job title"
	class="text-muted-foreground text-xl"
/>
