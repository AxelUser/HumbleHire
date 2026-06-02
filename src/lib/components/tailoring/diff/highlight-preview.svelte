<script lang="ts">
	import type { Highlight } from '$lib/types/cv';

	interface Props {
		entry: Highlight;
	}

	let { entry }: Props = $props();
</script>

<p class="text-foreground text-xs">{entry.text}</p>
