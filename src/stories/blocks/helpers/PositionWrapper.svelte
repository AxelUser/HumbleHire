<script lang="ts">
	import TextBlock from '$lib/components/blocks/text-block.svelte';

	const path = 'basics/position/';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	let value = $state('Senior Software Engineer');
	let hidden = $state<string[]>(startVisible ? [] : [path]);
</script>

<TextBlock
	bind:value
	bind:hidden
	{path}
	title="Position"
	placeholder="Your position / job title"
	class="text-muted-foreground text-xl"
/>
