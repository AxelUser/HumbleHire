<script lang="ts">
	import HighlightsBlock from '$lib/components/blocks/highlights-block.svelte';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	let highlights = $state<string[]>(
		startEmpty
			? []
			: [
					'Led infrastructure migrations across 3 AWS regions with zero downtime.',
					'Owned the deploy pipeline from local dev to production for 2 years.',
					'Mentored 4 junior engineers through structured pairing sessions.'
				]
	);
	let visible = $state(startVisible);
</script>

<HighlightsBlock bind:highlights bind:visible />
