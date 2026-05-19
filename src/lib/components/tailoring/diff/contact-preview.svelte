<script lang="ts">
	import type { ContactEntry } from '$lib/types/cv';

	interface Props {
		entry: ContactEntry;
	}

	let { entry }: Props = $props();
</script>

{#if entry.label}
	<p class="text-muted-foreground mt-0.5 text-xs">{entry.label}</p>
{/if}
