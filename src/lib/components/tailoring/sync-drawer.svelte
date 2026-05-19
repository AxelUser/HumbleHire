<script lang="ts">
	import {
		Drawer,
		DrawerContent,
		DrawerHeader,
		DrawerTitle,
		DrawerDescription,
		DrawerFooter
	} from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { RefreshCw } from '@lucide/svelte';
	import DiffItemRow from './diff-item-row.svelte';
	import { diffCVs } from '$lib/features/tailoring/diff';
	import { applySyncDecisions } from '$lib/features/tailoring/apply';
	import { describeDiff } from '$lib/features/tailoring/present';
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

	const groupedItems = $derived.by(() => {
		const groups: { label: string; items: DiffItem[] }[] = [];
		for (const item of diffItems) {
			const meta = describeDiff(item, masterCv, tailoredCv);
			const label = meta.blockLabel;
			const existing = groups.find((g) => g.label === label);
			if (existing) {
				existing.items.push(item);
			} else {
				groups.push({ label, items: [item] });
			}
		}
		return groups;
	});

	function isPreviouslyDiscarded(objectId: ObjectId): boolean {
		return (tailoredCv.syncDecisions?.discarded ?? {})[objectId] !== undefined;
	}

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

	function openDrawer() {
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

	$effect(() => {
		if (!open) {
			decisions = new Map();
		}
	});
</script>

{#if tailoredCv.sourceId}
	<Button variant="accent" size="sm" onclick={openDrawer}>
		<RefreshCw class="h-3.5 w-3.5" /> Review · Sync
	</Button>

	<Drawer bind:open direction="right" shouldScaleBackground={false}>
		<DrawerContent
			class="bg-card data-[vaul-drawer-direction=right]:border-foreground h-full overflow-hidden rounded-none data-[vaul-drawer-direction=right]:rounded-none data-[vaul-drawer-direction=right]:border-l-2 data-[vaul-drawer-direction=right]:sm:max-w-md"
		>
			<DrawerHeader class="border-foreground shrink-0 border-b-2">
				<DrawerTitle class="font-bold">Sync from Master</DrawerTitle>
				<DrawerDescription class="text-xs">
					Review changes from <strong class="text-foreground">{masterCv.name}</strong>. Accept or
					dismiss each change.
				</DrawerDescription>
				{#if diffItems.length > 0}
					<div class="mt-2 flex items-center justify-between gap-2">
						<span class="text-muted-foreground text-xs">
							{diffItems.length} change{diffItems.length === 1 ? '' : 's'} ·
							{pendingCount} pending
						</span>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" onclick={acceptAll}>Accept all</Button>
							<Button variant="outline" size="sm" onclick={discardAll}>Dismiss all</Button>
						</div>
					</div>
				{/if}
			</DrawerHeader>

			<div class="flex-1 overflow-y-auto p-4">
				{#if diffItems.length === 0}
					<div class="text-muted-foreground py-8 text-center text-sm">
						<p>No relevant changes from the master CV.</p>
						<p class="mt-1 text-xs">Closing will clear the sync indicator.</p>
					</div>
				{:else}
					<div class="flex flex-col gap-4">
						{#each groupedItems as group}
							<div>
								<span
									class="text-accent mb-2 block text-xs font-extrabold tracking-widest uppercase"
								>
									{group.label}
								</span>
								<div class="flex flex-col gap-2">
									{#each group.items as item (item.objectId)}
										<DiffItemRow
											{item}
											{masterCv}
											{tailoredCv}
											previouslyDiscarded={isPreviouslyDiscarded(item.objectId)}
											decision={decisions.get(item.objectId)}
											onAccept={() => accept(item.objectId)}
											onDiscard={() => discard(item.objectId)}
											onRevert={() => revert(item.objectId)}
										/>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<DrawerFooter class="border-foreground shrink-0 flex-row justify-end gap-2 border-t-2">
				<Button variant="outline" onclick={handleClose}>Close</Button>
				<Button onclick={handleApply} disabled={diffItems.length > 0 && pendingCount > 0}>
					Apply changes
					{#if pendingCount > 0}
						<span class="text-muted-foreground ml-1 text-xs">({pendingCount} pending)</span>
					{/if}
				</Button>
			</DrawerFooter>
		</DrawerContent>
	</Drawer>
{/if}
