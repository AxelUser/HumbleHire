<script lang="ts">
	import type { ProjectEntry } from '$lib/types/cv';
	import TagList from './tag-list.svelte';

	interface Props {
		entry: ProjectEntry;
	}

	let { entry }: Props = $props();
</script>

{#if entry.link}
	<p class="text-muted-foreground mt-0.5 text-xs">{entry.link}</p>
{/if}
{#if entry.description}
	<ul class="text-foreground mt-2 list-disc pl-4 text-xs">
		<li>{entry.description}</li>
	</ul>
{/if}
<TagList tags={entry.stack.map((s) => s.value)} />
