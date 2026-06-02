<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		tags: string[];
	}

	let { tags }: Props = $props();
</script>

{#if tags.length > 0}
	<div class="mt-2 flex flex-wrap gap-1">
		{#each tags as tag, i (i)}
			<Badge variant="secondary" class="text-xs">{tag}</Badge>
		{/each}
	</div>
{/if}
