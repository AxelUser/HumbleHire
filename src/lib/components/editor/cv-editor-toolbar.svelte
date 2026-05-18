<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { getCVStoreContext } from '$lib/stores/cv.svelte';
	import { Scissors, RefreshCw, ExternalLink } from '@lucide/svelte';
	import SyncModal from '$lib/components/editor/sync-modal.svelte';
	import { TailorModal } from '$lib/components/dashboard';
	import type { CV } from '$lib/types/cv';
	import { hasUpdatesAvailable } from '$lib/features/tailoring/detection';

	interface Props {
		cvName: string;
		masterCv?: CV;
	}

	let { cvName = $bindable(), masterCv }: Props = $props();

	const cvStore = getCVStoreContext();

	let syncModalOpen = $state(false);
	let tailorModalOpen = $state(false);

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
	const canTailor = $derived(!isTailored);

	const updatesAvailable = $derived(
		masterCv && cvStore.cv ? hasUpdatesAvailable(masterCv, cvStore.cv) : false
	);
</script>

<div class="bg-background sticky top-14 z-10 px-6 py-3">
	<div
		class="border-foreground bg-card shadow-brutal mx-auto flex max-w-3xl items-center gap-4 border-2 px-6 py-3"
	>
		<div class="flex flex-1 items-center gap-4">
			<InlineField bind:value={cvName} class="text-lg font-bold" />
		</div>

		<div class="flex items-center gap-2">
			{#if isTailored && masterCv}
				<a
					href="/cv/{masterCv.id}"
					class="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
				>
					<ExternalLink class="h-3 w-3" />
					{masterCv.name}
				</a>

				<Button
					variant="ghost"
					size="sm"
					class={updatesAvailable ? 'text-primary relative' : ''}
					onclick={() => (syncModalOpen = true)}
				>
					<RefreshCw class="mr-1.5 h-4 w-4" />
					Sync
					{#if updatesAvailable}
						<span class="bg-primary absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full"></span>
					{/if}
				</Button>
			{/if}

			{#if canTailor && cvStore.cv}
				<Button variant="ghost" size="sm" onclick={() => (tailorModalOpen = true)}>
					<Scissors class="mr-1.5 h-4 w-4" />
					Tailor
				</Button>
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

{#if isTailored && masterCv && cvStore.cv}
	<SyncModal
		{masterCv}
		bind:tailoredCv={cvStore.cv}
		bind:open={syncModalOpen}
		onClose={() => (syncModalOpen = false)}
	/>
{/if}

{#if canTailor && cvStore.cv}
	<TailorModal
		sourceCv={cvStore.cv}
		bind:open={tailorModalOpen}
		onCreate={(id) => (window.location.href = `/cv/${id}`)}
	/>
{/if}
