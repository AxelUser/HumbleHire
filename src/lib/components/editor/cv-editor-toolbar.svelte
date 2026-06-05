<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { Badge } from '$lib/components/ui/badge';
	import { ExternalLink } from '@lucide/svelte';
	import { TailorDialog, SyncDrawer } from '$lib/components/tailoring';
	import { ExportButton } from '$lib/components/export';
	import type { CV } from '$lib/types/cv';
	import type { SaveStatus } from '$lib/types/save-status';
	import { resolve } from '$app/paths';

	interface Props {
		cvName: string;
		cv: CV;
		saveStatus: SaveStatus;
		masterCv?: CV;
		previewOpen?: boolean;
		onSync?: (updated: CV) => void;
	}

	let {
		cvName = $bindable(),
		cv,
		saveStatus,
		masterCv,
		previewOpen = $bindable(false),
		onSync
	}: Props = $props();

	const badgeLabel = $derived.by(() => {
		if (saveStatus.status !== 'saved') return null;
		const elapsed = Date.now() - saveStatus.savedAt;
		if (elapsed < 10_000) return 'just now';
		const minutes = Math.round(elapsed / 60_000);
		return `${minutes} min ago`;
	});

	const isTailored = $derived(!!cv.sourceId);
</script>

<div class="bg-background shrink-0 px-6 py-3">
	<div
		class="border-foreground bg-card shadow-brutal flex w-full items-center gap-4 border-2 px-6 py-3"
	>
		<div class="flex shrink-0 items-center">
			{#if saveStatus.status === 'saving'}
				<Badge variant="secondary">Saving…</Badge>
			{:else if saveStatus.status === 'saved' && badgeLabel !== null}
				<Badge variant="outline">
					{badgeLabel === 'just now' ? 'Saved just now' : `Saved ${badgeLabel}`}
				</Badge>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<InlineField bind:value={cvName} class="text-lg font-bold" />
		</div>

		<div class="flex shrink-0 items-center gap-2">
			{#if isTailored && masterCv}
				<a
					href={resolve(`/cv/${masterCv.id}`)}
					class="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
				>
					<ExternalLink class="h-3 w-3" />
					{masterCv.name}
				</a>

				<SyncDrawer {masterCv} tailoredCv={cv} onSync={(updated) => onSync?.(updated)} />
			{/if}

			<TailorDialog
				sourceCv={cv}
				onCreate={(id) => (window.location.href = resolve(`/cv/${id}`))}
			/>

			<ExportButton {cv} />
		</div>
	</div>
</div>
