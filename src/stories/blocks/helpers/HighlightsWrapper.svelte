<script lang="ts">
	import BulletListBlock from '$lib/components/blocks/bullet-list-block.svelte';
	import { createObjectId, type StringEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	let highlights = $state<StringEntry[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						value: 'Led infrastructure migrations across 3 AWS regions with zero downtime.'
					},
					{
						objectId: createObjectId(),
						value: 'Owned the deploy pipeline from local dev to production for 2 years.'
					},
					{
						objectId: createObjectId(),
						value: 'Mentored 4 junior engineers through structured pairing sessions.'
					}
				]
	);
	let hidden = $state<string[]>(startVisible ? [] : ['basics/highlights/']);
</script>

<BulletListBlock bind:highlights bind:hidden />
