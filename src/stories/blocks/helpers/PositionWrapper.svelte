<script lang="ts">
	import PositionBlock from '$lib/components/blocks/position-block.svelte';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();
	let value = $state('Senior Software Engineer');
	let visible = $state(startVisible);
</script>

<PositionBlock bind:value bind:visible />
