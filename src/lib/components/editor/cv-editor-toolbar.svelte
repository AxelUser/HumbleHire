<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { Badge } from '$lib/components/ui/badge';
	import { getCVStoreContext } from '$lib/stores/cv.svelte';
	import { ExternalLink } from '@lucide/svelte';
	import { TailorDialog, SyncDrawer } from '$lib/components/tailoring';
	import ExportButton from './export-button.svelte';
	import type { CV } from '$lib/types/cv';
	import { resolve } from '$app/paths';

	interface Props {
		cvName: string;
		masterCv?: CV;
		previewOpen?: boolean;
	}

	let { cvName = $bindable(), masterCv, previewOpen = $bindable(false) }: Props = $props();

	const cvStore = getCVStoreContext();

	const badgeLabel = $derived.by(() => {
		const status = cvStore.saveStatus;
		const lastSavedAt = cvStore.lastSavedAt;
		if (status === 'saving') return 'saving';
		if (status === 'saved' && lastSavedAt !== null) {
			const elapsed = Date.now() - lastSavedAt;
			if (elapsed < 10_000) return 'just now';
			const minutes = Math.round(elapsed / 60_000);
			return `${minutes} min ago`;
		}
		return null;
	});

	const isTailored = $derived(!!cvStore.cv?.sourceId);
</script>

<div class="bg-background sticky top-14 z-10 px-6 py-3">
	<div
		class="border-foreground bg-card shadow-brutal mx-auto flex max-w-7xl items-center gap-4 border-2 px-6 py-3"
	>
		<div class="flex flex-1 items-center gap-4">
			<InlineField bind:value={cvName} class="text-lg font-bold" />
		</div>

		<div class="flex items-center gap-2">
			{#if isTailored && masterCv}
				<a
					href={resolve(`/cv/${masterCv.id}`)}
					class="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
				>
					<ExternalLink class="h-3 w-3" />
					{masterCv.name}
				</a>

				{#if cvStore.cv}
					<SyncDrawer
						{masterCv}
						tailoredCv={cvStore.cv}
						onSync={(updated) => (cvStore.cv = updated)}
					/>
				{/if}
			{/if}

			{#if cvStore.cv}
				<TailorDialog
					sourceCv={cvStore.cv}
					onCreate={(id) => (window.location.href = resolve(`/cv/${id}`))}
				/>
				<ExportButton cv={cvStore.cv} />
			{/if}

			{#if cvStore.saveStatus === 'saving'}
				<Badge variant="secondary">Saving…</Badge>
			{:else if cvStore.saveStatus === 'saved' && badgeLabel !== null}
				<Badge variant="outline">
					{#if badgeLabel === 'just now'}
						Saved just now
					{:else}
						Saved {badgeLabel}
					{/if}
				</Badge>
			{/if}
		</div>
	</div>
</div>
