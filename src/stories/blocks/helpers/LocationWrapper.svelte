<script lang="ts">
	import TextBlock from '$lib/components/blocks/text-block.svelte';

	const path = 'basics/location/';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	let value = $state('San Francisco, CA (open to remote)');
	let hidden = $state<string[]>(startVisible ? [] : [path]);
</script>

<TextBlock bind:value bind:hidden {path} title="Location" placeholder="City, Country" />
