<script lang="ts">
	import TextBlock from '$lib/components/blocks/text-block.svelte';

	const path = 'basics/fullName/';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();

	let value = $state('Aleksey Maltsev');
	let hidden = $state<string[]>(startVisible ? [] : [path]);
</script>

<TextBlock
	bind:value
	bind:hidden
	{path}
	title="Full Name"
	placeholder="Your full name"
	class="text-3xl font-bold"
/>
