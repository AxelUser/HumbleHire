<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import { CvCard } from '$lib/components/dashboard';
	import { Button } from '$lib/components/ui/button';
	import { FileText } from '@lucide/svelte';

	type FilterMode = 'all' | 'source' | 'tailored';

	interface Props {
		cvs: CV[];
		onDelete: (id: string) => void;
		onTailor: (id: string) => void;
		onSync: (cv: CV) => void;
	}

	let { cvs, onDelete, onTailor, onSync }: Props = $props();

	let filter = $state<FilterMode>('all');

	const filtered = $derived.by(() => {
		if (filter === 'source') return cvs.filter((cv) => !cv.sourceId);
		if (filter === 'tailored') return cvs.filter((cv) => !!cv.sourceId);
		return cvs;
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex gap-2">
		{#each [['all', 'All'], ['source', 'Source CVs'], ['tailored', 'Tailored CVs']] as [mode, label] (mode)}
			<Button
				variant={filter === mode ? 'default' : 'outline'}
				size="sm"
				onclick={() => (filter = mode as FilterMode)}
			>
				{label}
			</Button>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="text-muted-foreground py-16 text-center">
			<FileText class="mx-auto mb-4 h-12 w-12 opacity-40" />
			<p>
				{#if filter === 'all'}
					No CVs yet. Create one to get started.
				{:else if filter === 'tailored'}
					No tailored CVs yet. Tailor a CV from the dashboard.
				{:else}
					No source CVs found.
				{/if}
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as cv (cv.id)}
				<CvCard {cv} allCvs={cvs} {onDelete} {onTailor} {onSync} />
			{/each}
		</div>
	{/if}
</div>
