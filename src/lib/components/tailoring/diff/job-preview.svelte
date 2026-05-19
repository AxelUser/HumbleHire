<script lang="ts">
	import type { JobEntry } from '$lib/types/cv';
	import { formatPeriod, joinParts } from '$lib/features/tailoring/present';
	import TagList from './tag-list.svelte';

	interface Props {
		entry: JobEntry;
	}

	let { entry }: Props = $props();
	const subtitle = $derived(joinParts(entry.role, formatPeriod(entry.startDate, entry.endDate)));
</script>

{#if subtitle}
	<p class="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
{/if}
{#if entry.achievements.length > 0}
	<ul class="text-foreground mt-2 list-disc space-y-0.5 pl-4 text-xs">
		{#each entry.achievements as ach (ach.objectId)}
			<li>{ach.text}</li>
		{/each}
	</ul>
{/if}
<TagList tags={entry.skills.map((s) => s.value)} />
