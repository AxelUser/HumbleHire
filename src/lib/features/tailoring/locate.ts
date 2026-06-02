import type { CV, CVBlocks, ListBlockKey, ObjectId, WithId } from '$lib/types/cv';
import type { AnyEntry, DiffItem, NestedListKey } from './types';

function blockArray(blocks: CVBlocks, blockKey: ListBlockKey): WithId[] {
	return blocks[blockKey].value as unknown as WithId[];
}

function nestedArray(entry: AnyEntry, nestedListKey: NestedListKey): WithId[] {
	return (entry as unknown as Record<string, WithId[]>)[nestedListKey] ?? [];
}

export function findEntry(
	blocks: CVBlocks,
	blockKey: ListBlockKey,
	objectId: ObjectId
): AnyEntry | undefined {
	return blockArray(blocks, blockKey).find((e) => e.objectId === objectId) as AnyEntry | undefined;
}

export function findParentEntry(
	blocks: CVBlocks,
	blockKey: ListBlockKey,
	parentObjectId: ObjectId
): AnyEntry | undefined {
	return blockArray(blocks, blockKey).find((e) => e.objectId === parentObjectId) as
		| AnyEntry
		| undefined;
}

export function findNestedEntry(
	blocks: CVBlocks,
	blockKey: ListBlockKey,
	parentObjectId: ObjectId,
	nestedListKey: NestedListKey,
	objectId: ObjectId
): AnyEntry | undefined {
	const parent = findParentEntry(blocks, blockKey, parentObjectId);
	if (!parent) return undefined;
	return nestedArray(parent, nestedListKey).find((e) => e.objectId === objectId) as
		| AnyEntry
		| undefined;
}

/**
 * Resolves the entry object from the appropriate CV:
 * - added → master (entry not yet in tailored)
 * - removed → tailored (entry no longer in master)
 * - modified → master (authoritative after-state)
 */
export function resolveDiffEntry(
	item: DiffItem,
	masterCv: CV,
	tailoredCv: CV
): AnyEntry | undefined {
	if (item.kind === 'text') return undefined;
	const cv = item.change === 'removed' ? tailoredCv : masterCv;
	if (item.kind === 'entry') return findEntry(cv.blocks, item.blockKey, item.objectId);
	return findNestedEntry(
		cv.blocks,
		item.blockKey,
		item.parentObjectId,
		item.nestedListKey,
		item.objectId
	);
}

/**
 * Resolves the parent entry for a nested diff item (for title display).
 * Parent always exists in master for nested add/modify; falls back to tailored for removed.
 */
export function resolveParentEntry(
	item: Extract<DiffItem, { kind: 'nested' }>,
	masterCv: CV,
	tailoredCv: CV
): AnyEntry | undefined {
	return (
		findParentEntry(masterCv.blocks, item.blockKey, item.parentObjectId) ??
		findParentEntry(tailoredCv.blocks, item.blockKey, item.parentObjectId)
	);
}
