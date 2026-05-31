<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import { CVSearch } from '$lib/features/dashboard/search.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import MasterGroup from './master-group.svelte';
	import SearchBar from './search-bar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { X, FileQuestionMark } from '@lucide/svelte';

	interface Props {
		cvs: CV[];
		onDelete: (id: string) => void;
		onTailor: (id: string) => void;
		onSync: (updated: CV) => void;
	}

	let { cvs, onDelete, onTailor, onSync }: Props = $props();

	const search = new CVSearch(() => cvs);
</script>

<div class="flex flex-col gap-4">
	<SearchBar
		bind:query={search.query}
		matchCount={search.matchCount}
		masterCount={search.masterCount}
		tailoredCount={search.tailoredCount}
	/>
	<div class="flex flex-col gap-[18px]">
		{#each search.groups as { master, tailored } (master.id)}
			<MasterGroup
				{master}
				{tailored}
				highlights={search.highlights}
				{onDelete}
				{onTailor}
				{onSync}
			/>
		{:else}
			{#if search.query.trim()}
				<Empty.Root>
					<Empty.Header>
						<Empty.Media variant="icon">
							<FileQuestionMark class="size-10" />
						</Empty.Media>
						<Empty.Title>No matches</Empty.Title>
						<Empty.Description>
							Nothing matched "{search.query}".
						</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<Button variant="accent" onclick={() => (search.query = '')}>
							<X class="h-4 w-4" /> Clear search
						</Button>
					</Empty.Content>
				</Empty.Root>
			{/if}
		{/each}
	</div>
</div>
