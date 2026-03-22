<script lang="ts">
	import LocationBlock from '$lib/components/blocks/location-block.svelte';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();
	let value = $state('San Francisco, CA (open to remote)');
	let visible = $state(startVisible);
</script>

<LocationBlock bind:value bind:visible />
