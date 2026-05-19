<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import MasterGroup from './master-group.svelte';
	import SearchBar from './search-bar.svelte';

	interface Props {
		cvs: CV[];
		onDelete: (id: string) => void;
		onTailor: (id: string) => void;
		onSync: (updated: CV) => void;
	}

	let { cvs, onDelete, onTailor, onSync }: Props = $props();

	const groups = $derived.by(() => {
		const allIds = new Set(cvs.map((c) => c.id));
		const groupHeads = cvs.filter((c) => !c.sourceId || !allIds.has(c.sourceId));
		return groupHeads.map((master) => ({
			master,
			tailored: cvs
				.filter((c) => c.sourceId === master.id)
				.sort((a, b) => b.createdAt - a.createdAt)
		}));
	});

	const tailoredCount = $derived(cvs.filter((c) => !!c.sourceId).length);
</script>

<div class="flex flex-col gap-4">
	<SearchBar masterCount={groups.length} {tailoredCount} />
	<div class="flex flex-col gap-[18px]">
		{#each groups as { master, tailored } (master.id)}
			<MasterGroup {master} {tailored} {onDelete} {onTailor} {onSync} />
		{/each}
	</div>
</div>
