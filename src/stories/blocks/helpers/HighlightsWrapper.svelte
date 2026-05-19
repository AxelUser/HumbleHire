<script lang="ts">
	import BulletListBlock from '$lib/components/blocks/bullet-list-block.svelte';
	import { createObjectId } from '$lib/types/cv';
	import type { ObjectId, Highlight } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	const blockId = createObjectId();

	let highlights = $state<Highlight[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						text: 'Led infrastructure migrations across 3 AWS regions with zero downtime.'
					},
					{
						objectId: createObjectId(),
						text: 'Owned the deploy pipeline from local dev to production for 2 years.'
					},
					{
						objectId: createObjectId(),
						text: 'Mentored 4 junior engineers through structured pairing sessions.'
					}
				]
	);
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [blockId]);
</script>

<BulletListBlock bind:highlights {blockId} bind:hiddenBlockIds />
