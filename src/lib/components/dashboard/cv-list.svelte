<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import { CvCard } from '$lib/components/dashboard';
	import { FileText } from '@lucide/svelte';

	interface Props {
		cvs: CV[];
		onDelete: (id: string) => void;
	}

	let { cvs, onDelete }: Props = $props();
</script>

{#if cvs.length === 0}
	<div class="text-muted-foreground py-16 text-center">
		<FileText class="mx-auto mb-4 h-12 w-12 opacity-40" />
		<p>No CVs yet. Create one to get started.</p>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each cvs as cv (cv.id)}
			<CvCard {cv} {onDelete} />
		{/each}
	</div>
{/if}
