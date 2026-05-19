<script lang="ts">
	import type { EducationEntry } from '$lib/types/cv';
	import { formatPeriod, joinParts } from '$lib/features/tailoring/present';

	interface Props {
		entry: EducationEntry;
	}

	let { entry }: Props = $props();
	const subtitle = $derived(joinParts(entry.degree, formatPeriod(entry.startDate, entry.endDate)));
</script>

{#if subtitle}
	<p class="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
{/if}
