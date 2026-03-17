<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '$lib/components/ui/collapsible';
	import { db } from '$lib/db/index';
	import type { CVVersion } from '$lib/types/cv';

	interface Props {
		cvId: string;
	}

	let { cvId }: Props = $props();

	let isOpen = $state(false);

	const versionsPromise = $derived(
		db.versions.where('cvId').equals(cvId).reverse().sortBy('createdAt')
	);
</script>

<div class="border-2 border-foreground bg-card shadow-brutal">
	<Collapsible bind:open={isOpen}>
		<CollapsibleTrigger
			class="flex w-full items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted/50 {isOpen
				? 'border-b-2 border-foreground'
				: ''}"
		>
			{#await versionsPromise then versions}
				<span>Version History ({versions.length})</span>
			{:catch}
				<span>Version History</span>
			{/await}
			<ChevronDown
				class="h-4 w-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
			/>
		</CollapsibleTrigger>

		<CollapsibleContent>
			<div class="flex flex-col gap-2 px-4 py-4">
				{#await versionsPromise}
					<p class="text-sm text-muted-foreground">Loading…</p>
				{:then versions}
					{#if versions.length === 0}
						<p class="text-sm text-muted-foreground">No saved versions yet.</p>
					{:else}
						{#each versions as version (version.id)}
							<div class="border-2 border-foreground bg-background p-3">
								<p class="font-medium">{version.name}</p>
								<p class="text-xs text-muted-foreground">
									{new Date(version.createdAt).toLocaleDateString()}
								</p>
								{#if version.notes}
									<p class="mt-1 text-sm text-muted-foreground">{version.notes}</p>
								{/if}
							</div>
						{/each}
					{/if}
				{:catch}
					<p class="text-sm text-destructive">Failed to load versions.</p>
				{/await}
			</div>
		</CollapsibleContent>
	</Collapsible>
</div>
