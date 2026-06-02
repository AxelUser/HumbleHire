<script lang="ts">
	import InlineField from '$lib/components/ui/inline-field/inline-field.svelte';

	interface Props {
		startValue?: string;
	}

	let { startValue = 'Aleksey Maltsev' }: Props = $props();
	let value = $state(startValue);
</script>

<InlineField bind:value placeholder="Enter text..." />
