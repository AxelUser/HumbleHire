<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { getCVStoreContext } from '$lib/stores/cv.svelte';

	interface Props {
		cvName: string;
		onSaveVersion: () => void;
	}

	let { cvName = $bindable(), onSaveVersion }: Props = $props();

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
</script>

<div class="sticky top-14 z-10 flex items-center gap-4 border-b-2 bg-background px-6 py-3">
	<div class="flex flex-1 items-center gap-4">
		<InlineField bind:value={cvName} class="text-lg font-bold" />
	</div>

	<div class="flex items-center gap-3">
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

		<Button variant="default" size="sm" onclick={onSaveVersion}>Save Version</Button>
	</div>
</div>
