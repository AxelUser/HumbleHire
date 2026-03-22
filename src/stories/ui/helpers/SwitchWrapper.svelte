<script lang="ts">
	import Switch from '$lib/components/ui/switch/switch.svelte';

	interface Props {
		startValue?: boolean;
	}

	let { startValue = false }: Props = $props();
	let checked = $state(startValue);
</script>

<Switch bind:checked />
