<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { RefreshCw } from '@lucide/svelte';
	import DiffItemRow from './diff-item-row.svelte';
	import { diffCVs } from '$lib/features/tailoring/diff';
	import { applySyncDecisions } from '$lib/features/tailoring/apply';
	import type { DiffItem } from '$lib/features/tailoring/types';
	import type { CV, ObjectId } from '$lib/types/cv';
	import { dev } from '$app/environment';

	interface Props {
		masterCv: CV;
		tailoredCv: CV;
		onSync: (updated: CV) => void;
		open?: boolean;
	}

	let { masterCv, tailoredCv, onSync, open = $bindable(false) }: Props = $props();

	let decisions = $state(new Map<ObjectId, 'accepted' | 'discarded'>());

	const diffItems = $derived.by((): DiffItem[] =>
		diffCVs($state.snapshot(masterCv), $state.snapshot(tailoredCv))
	);

	function accept(objectId: ObjectId) {
		decisions.set(objectId, 'accepted');
		decisions = new Map(decisions);
	}

	function discard(objectId: ObjectId) {
		decisions.set(objectId, 'discarded');
		decisions = new Map(decisions);
	}

	function revert(objectId: ObjectId) {
		decisions.delete(objectId);
		decisions = new Map(decisions);
	}

	function acceptAll() {
		for (const item of diffItems) {
			decisions.set(item.objectId, 'accepted');
		}
		decisions = new Map(decisions);
	}

	function discardAll() {
		for (const item of diffItems) {
			decisions.set(item.objectId, 'discarded');
		}
		decisions = new Map(decisions);
	}

	function openDialog() {
		decisions = new Map();
		open = true;
		if (dev) {
			console.log('Diff items:', diffItems);
		}
	}

	function handleApply() {
		const snapshot = $state.snapshot(tailoredCv) as CV;
		applySyncDecisions(snapshot, $state.snapshot(masterCv) as CV, decisions);
		onSync(snapshot);
		decisions = new Map();
		open = false;
	}

	function handleClose() {
		decisions = new Map();
		open = false;
	}

	const pendingCount = $derived(diffItems.filter((item) => !decisions.has(item.objectId)).length);
</script>

{#if tailoredCv.sourceId}
	<Button variant="accent" size="sm" onclick={openDialog}>
		<RefreshCw class="h-3.5 w-3.5" /> Review · Sync
	</Button>

	<Dialog bind:open>
		<DialogContent class="flex max-h-[85vh] max-w-2xl flex-col">
			<DialogHeader>
				<DialogTitle>Sync from Master</DialogTitle>
				<DialogDescription>
					Review changes from <strong>{masterCv.name}</strong>. Accept or dismiss each change.
				</DialogDescription>
			</DialogHeader>

			<div class="min-h-0 flex-1 overflow-y-auto py-2">
				{#if diffItems.length === 0}
					<div class="text-muted-foreground py-8 text-center text-sm">
						<p>No relevant changes from the master CV.</p>
					</div>
				{:else}
					<div class="flex items-center justify-between gap-2 pb-3">
						<span class="text-muted-foreground text-xs">
							{diffItems.length} change{diffItems.length === 1 ? '' : 's'} ·
							{pendingCount} pending
						</span>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" onclick={acceptAll}>Accept all</Button>
							<Button variant="outline" size="sm" onclick={discardAll}>Dismiss all</Button>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						{#each diffItems as item (item.objectId)}
							<DiffItemRow
								{item}
								{masterCv}
								{tailoredCv}
								decision={decisions.get(item.objectId)}
								onAccept={() => accept(item.objectId)}
								onDiscard={() => discard(item.objectId)}
								onRevert={() => revert(item.objectId)}
							/>
						{/each}
					</div>
				{/if}
			</div>

			<DialogFooter>
				<Button variant="outline" onclick={handleClose}>Close</Button>
				<Button onclick={handleApply} disabled={diffItems.length > 0 && pendingCount > 0}>
					Apply changes
					{#if pendingCount > 0}
						<span class="text-muted-foreground ml-1 text-xs">({pendingCount} pending)</span>
					{/if}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
{/if}
