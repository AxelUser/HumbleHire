<script lang="ts">
	import InlineTextarea from '$lib/components/ui/inline-textarea/inline-textarea.svelte';

	interface Props {
		startValue?: string;
	}

	let { startValue = 'Pragmatic engineer with a bias for shipping.' }: Props = $props();
	let value = $state(startValue);
</script>

<InlineTextarea bind:value placeholder="Enter text..." rows={3} />
