<script lang="ts">
	import type { Achievement } from '$lib/types/cv';

	interface Props {
		entry: Achievement;
	}

	let { entry }: Props = $props();
</script>

<p class="text-foreground text-xs">{entry.text}</p>
