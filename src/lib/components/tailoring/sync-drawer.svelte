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
	import { encodePath } from '$lib/features/tailoring/paths';
	import { describeDiff } from '$lib/features/tailoring/present';
	import { SvelteMap } from 'svelte/reactivity';
	import type { DiffItem } from '$lib/features/tailoring/types';
	import type { CV } from '$lib/types/cv';

	interface Props {
		masterCv: CV;
		tailoredCv: CV;
		onSync: (updated: CV) => void;
		open?: boolean;
	}

	let { masterCv, tailoredCv, onSync, open = $bindable(false) }: Props = $props();

	// Decisions key by the encoded path — the same key apply uses to look each one up.
	let decisions = new SvelteMap<string, 'accepted' | 'discarded'>();

	const keyOf = (item: DiffItem) => encodePath(item.path);

	const diffItems = $derived.by((): DiffItem[] =>
		diffCVs($state.snapshot(masterCv), $state.snapshot(tailoredCv))
	);

	const groupedItems = $derived.by(() => {
		const groups: { label: string; items: DiffItem[] }[] = [];
		for (const item of diffItems) {
			const label = describeDiff(item, masterCv, tailoredCv).breadcrumb[0] ?? '';
			const existing = groups.find((g) => g.label === label);
			if (existing) existing.items.push(item);
			else groups.push({ label, items: [item] });
		}
		return groups;
	});

	function accept(key: string) {
		decisions.set(key, 'accepted');
	}

	function discard(key: string) {
		decisions.set(key, 'discarded');
	}

	function revert(key: string) {
		decisions.delete(key);
	}

	function acceptAll() {
		for (const item of diffItems) decisions.set(keyOf(item), 'accepted');
	}

	function discardAll() {
		for (const item of diffItems) decisions.set(keyOf(item), 'discarded');
	}

	function openDrawer() {
		decisions.clear();
		open = true;
	}

	function handleApply() {
		const snapshot = $state.snapshot(tailoredCv) as CV;
		applySyncDecisions(snapshot, $state.snapshot(masterCv) as CV, decisions);
		onSync(snapshot);
		decisions.clear();
		open = false;
	}

	function handleClose() {
		decisions.clear();
		open = false;
	}

	const pendingCount = $derived(diffItems.filter((item) => !decisions.has(keyOf(item))).length);

	$effect(() => {
		if (!open) {
			decisions.clear();
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
					</div>
				{:else}
					<div class="flex flex-col gap-4">
						{#each groupedItems as group (group.label)}
							<div>
								<span
									class="text-accent mb-2 block text-xs font-extrabold tracking-widest uppercase"
								>
									{group.label}
								</span>
								<div class="flex flex-col gap-2">
									{#each group.items as item (keyOf(item))}
										<DiffItemRow
											{item}
											{masterCv}
											{tailoredCv}
											decision={decisions.get(keyOf(item))}
											onAccept={() => accept(keyOf(item))}
											onDiscard={() => discard(keyOf(item))}
											onRevert={() => revert(keyOf(item))}
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
