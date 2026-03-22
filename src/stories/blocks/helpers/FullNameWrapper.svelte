<script lang="ts">
	import FullNameBlock from '$lib/components/blocks/full-name-block.svelte';

	interface Props {
		startVisible?: boolean;
	}

	let { startVisible = true }: Props = $props();
	let value = $state('Aleksey Maltsev');
	let visible = $state(startVisible);
</script>

<FullNameBlock bind:value bind:visible />
