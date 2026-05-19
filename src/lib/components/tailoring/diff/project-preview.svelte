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
	<ul class="text-foreground mt-2 flex flex-col gap-1.5 text-xs">
		<li class="flex gap-2">
			<span class="text-muted-foreground mt-[0.1rem] leading-none">■</span>
			<span>{entry.description}</span>
		</li>
	</ul>
{/if}
<TagList tags={entry.stack.map((s) => s.value)} />
