<script lang="ts">
	import TextBlock from '$lib/components/blocks/text-block.svelte';
	import { createObjectId } from '$lib/types/cv';
	import type { ObjectId, TextBlock as TextBlockData } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	let block = $state<TextBlockData>({ objectId: createObjectId(), value: 'Aleksey Maltsev' });
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [block.objectId]);
</script>

<TextBlock
	bind:block
	bind:hiddenBlockIds
	title="Full Name"
	placeholder="Your full name"
	class="text-3xl font-bold"
/>
