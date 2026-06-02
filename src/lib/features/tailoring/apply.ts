import type { CV, ObjectId, WithId } from '$lib/types/cv';
import { diffCVs } from './diff';
import { computeBlockHashes } from './hash';
import type { AnyEntry, DiffItem, EntryDiffItem, NestedDiffItem } from './types';
import { findEntry, findNestedEntry, findParentEntry } from './locate';

function applyItem(tailored: CV, master: CV, item: DiffItem): void {
	switch (item.kind) {
		case 'text': {
			tailored.blocks[item.blockKey].value = item.after;
			break;
		}
		case 'entry': {
			switch (item.change) {
				case 'added':
					applyEntryAdded(tailored, master, item);
					break;
				case 'removed':
					applyEntryRemoved(tailored, item);
					break;
				case 'modified':
					applyEntryModified(tailored, item);
					break;
			}
			break;
		}
		case 'nested': {
			switch (item.change) {
				case 'added':
					applyNestedAdded(tailored, master, item);
					break;
				case 'removed':
					applyNestedRemoved(tailored, item);
					break;
				case 'modified':
					applyNestedModified(tailored, item);
					break;
			}
			break;
		}
	}
}

function applyEntryAdded(
	tailored: CV,
	master: CV,
	item: Extract<EntryDiffItem, { change: 'added' | 'removed' }>
): void {
	const entry = findEntry(master.blocks, item.blockKey, item.objectId);
	if (!entry) return;
	const block = tailored.blocks[item.blockKey] as unknown as { value: AnyEntry[] };
	block.value.push(structuredClone(entry));
}

function applyEntryRemoved(
	tailored: CV,
	item: Extract<EntryDiffItem, { change: 'added' | 'removed' }>
): void {
	const block = tailored.blocks[item.blockKey] as unknown as { value: WithId[] };
	block.value = block.value.filter((e) => e.objectId !== item.objectId);
}

function applyEntryModified(
	tailored: CV,
	item: Extract<EntryDiffItem, { change: 'modified' }>
): void {
	const entry = (tailored.blocks[item.blockKey].value as unknown as WithId[]).find(
		(e) => e.objectId === item.objectId
	);
	if (entry) Object.assign(entry, item.after);
}

function applyNestedAdded(
	tailored: CV,
	master: CV,
	item: Extract<NestedDiffItem, { change: 'added' | 'removed' }>
): void {
	const entry = findNestedEntry(
		master.blocks,
		item.blockKey,
		item.parentObjectId,
		item.nestedListKey,
		item.objectId
	);
	if (!entry) return;
	const parent = findParentEntry(tailored.blocks, item.blockKey, item.parentObjectId) as
		| Record<string, WithId[]>
		| undefined;
	if (!parent) return;
	parent[item.nestedListKey].push(structuredClone(entry) as WithId);
}

function applyNestedRemoved(
	tailored: CV,
	item: Extract<NestedDiffItem, { change: 'added' | 'removed' }>
): void {
	const parent = findParentEntry(tailored.blocks, item.blockKey, item.parentObjectId) as
		| Record<string, WithId[]>
		| undefined;
	if (!parent) return;
	parent[item.nestedListKey] = parent[item.nestedListKey].filter(
		(e) => e.objectId !== item.objectId
	);
}

function applyNestedModified(
	tailored: CV,
	item: Extract<NestedDiffItem, { change: 'modified' }>
): void {
	const parent = findParentEntry(tailored.blocks, item.blockKey, item.parentObjectId) as
		| Record<string, WithId[]>
		| undefined;
	if (!parent) return;
	const nested = parent[item.nestedListKey].find((e) => e.objectId === item.objectId);
	if (nested) Object.assign(nested, item.after);
}

export function applySyncDecisions(
	tailoredCv: CV,
	masterCv: CV,
	decisions: Map<ObjectId, 'accepted' | 'discarded'>
): void {
	const items = diffCVs(masterCv, tailoredCv);

	for (const item of items) {
		if (decisions.get(item.objectId) === 'accepted') {
			applyItem(tailoredCv, masterCv, item);
		}
	}

	const allResolved = items.every((item) => decisions.has(item.objectId));
	if (allResolved) {
		tailoredCv.syncBaseline = structuredClone(masterCv.blocks);
		tailoredCv.syncBaselineHashes = { ...masterCv.blockHashes };
		tailoredCv.blockHashes = computeBlockHashes(tailoredCv.blocks);
	}
}
