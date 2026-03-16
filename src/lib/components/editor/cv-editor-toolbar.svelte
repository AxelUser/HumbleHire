<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { getSaveStatus, getLastSavedAt } from '$lib/stores/cv.svelte';

	interface Props {
		cvName: string;
		onSaveVersion: () => void;
	}

	let { cvName = $bindable(), onSaveVersion }: Props = $props();

	const badgeLabel = $derived.by(() => {
		const status = getSaveStatus();
		const lastSavedAt = getLastSavedAt();
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

<div class="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-6 py-3">
	<div class="flex-1">
		<InlineField bind:value={cvName} class="text-lg font-semibold" />
	</div>

	<div class="flex items-center gap-3">
		{#if getSaveStatus() === 'saving'}
			<Badge variant="secondary">Saving…</Badge>
		{:else if getSaveStatus() === 'saved' && badgeLabel !== null}
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
