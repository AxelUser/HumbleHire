import type { CV, Block, ObjectId, TextBlockKey, ListBlockKey, WithId } from '$lib/types/cv';
import type { DiffItem, NestedListKey } from './types';

/**
 * Diff a master CV and a tailored CV. It checks what has changed in master but not in tailored.
 * Internally it performs a 3 way diff between the master, tailored and tailored's baseline (the last one is the version of the master that was used to create the tailored CV).
 * Baseline is needed to distinguish between changes that were made in the tailored CV and changes that were made in the master CV.
 *
 * Diff tracks the following changes:
 * - Changes in plain text blocks, where value is already in the root of the block.
 * - Additions and removals of entries in list blocks.
 * - Changes in individual entries in list blocks, both in scalar fields and nested lists.
 *
 * So it can go max 2 levels deep: block own fields (text or list) -> entry's list or scalar fields.
 *
 * @param master - The master CV.
 * @param tailored - The tailored CV.
 * @returns A list of diff items.
 */
export function diffCVs(master: CV, tailored: CV): DiffItem[] {
	const items: DiffItem[] = [];
	const masterHidden = new Set(master.hiddenBlockIds);
	const tailoredHidden = new Set(tailored.hiddenBlockIds);
	const visible = (id: ObjectId) => !masterHidden.has(id) && !tailoredHidden.has(id);
	const baseline = tailored.syncBaseline ?? master.blocks;

	for (const key of ['fullName', 'position', 'location'] as const) {
		if (visible(master.blocks[key].objectId)) {
			diffText(items, key, baseline[key], master.blocks[key], tailored.blocks[key]);
		}
	}

	if (visible(master.blocks.contacts.objectId)) {
		diffList(
			items,
			'contacts',
			baseline.contacts.value,
			master.blocks.contacts.value,
			tailored.blocks.contacts.value
		);
	}
	if (visible(master.blocks.highlights.objectId)) {
		diffList(
			items,
			'highlights',
			baseline.highlights.value,
			master.blocks.highlights.value,
			tailored.blocks.highlights.value
		);
	}
	if (visible(master.blocks.education.objectId)) {
		diffList(
			items,
			'education',
			baseline.education.value,
			master.blocks.education.value,
			tailored.blocks.education.value
		);
	}
	if (visible(master.blocks.skills.objectId)) {
		diffList(
			items,
			'skills',
			baseline.skills.value,
			master.blocks.skills.value,
			tailored.blocks.skills.value,
			undefined,
			(b, m, t) => {
				diffList(items, 'skills', b.skills, m.skills, t.skills, {
					objectId: m.objectId,
					nestedListKey: 'skills'
				});
			}
		);
	}
	if (visible(master.blocks.jobHistory.objectId)) {
		diffList(
			items,
			'jobHistory',
			baseline.jobHistory.value,
			master.blocks.jobHistory.value,
			tailored.blocks.jobHistory.value,
			undefined,
			(b, m, t) => {
				diffList(items, 'jobHistory', b.achievements, m.achievements, t.achievements, {
					objectId: m.objectId,
					nestedListKey: 'achievements'
				});
				diffList(items, 'jobHistory', b.skills, m.skills, t.skills, {
					objectId: m.objectId,
					nestedListKey: 'skills'
				});
			}
		);
	}
	if (visible(master.blocks.projects.objectId)) {
		diffList(
			items,
			'projects',
			baseline.projects.value,
			master.blocks.projects.value,
			tailored.blocks.projects.value,
			undefined,
			(b, m, t) => {
				diffList(items, 'projects', b.stack, m.stack, t.stack, {
					objectId: m.objectId,
					nestedListKey: 'stack'
				});
			}
		);
	}

	return items;
}

function diffText(
	items: DiffItem[],
	blockKey: TextBlockKey,
	baseline: Block<string>,
	master: Block<string>,
	tailored: Block<string>
): void {
	if (baseline.value === master.value || tailored.value === master.value) return;
	items.push({
		kind: 'text',
		blockKey,
		objectId: master.objectId,
		before: tailored.value,
		after: master.value
	});
}

interface NestedParent {
	objectId: ObjectId;
	nestedListKey: NestedListKey;
}

function diffList<E extends WithId>(
	items: DiffItem[],
	blockKey: ListBlockKey,
	baseline: E[],
	master: E[],
	tailored: E[],
	parent?: NestedParent,
	onMatched?: (baseline: E, master: E, tailored: E) => void
): void {
	const baselineMap = new Map(baseline.map((e) => [e.objectId, e]));
	const masterMap = new Map(master.map((e) => [e.objectId, e]));
	const tailoredMap = new Map(tailored.map((e) => [e.objectId, e]));

	// In baseline but not in master: master deleted it, surface if tailored still has it.
	for (const baselineEntry of baseline) {
		if (!masterMap.has(baselineEntry.objectId) && tailoredMap.has(baselineEntry.objectId)) {
			if (parent) {
				items.push({
					kind: 'nested',
					change: 'removed',
					blockKey,
					nestedListKey: parent.nestedListKey,
					parentObjectId: parent.objectId,
					objectId: baselineEntry.objectId
				});
			} else {
				items.push({
					kind: 'entry',
					change: 'removed',
					blockKey,
					objectId: baselineEntry.objectId
				});
			}
		}
	}

	for (const masterEntry of master) {
		const baselineEntry = baselineMap.get(masterEntry.objectId);
		const tailoredEntry = tailoredMap.get(masterEntry.objectId);

		if (!baselineEntry) {
			// Not in baseline: master added it after tailoring.
			if (!tailoredEntry) {
				if (parent) {
					items.push({
						kind: 'nested',
						change: 'added',
						blockKey,
						nestedListKey: parent.nestedListKey,
						parentObjectId: parent.objectId,
						objectId: masterEntry.objectId
					});
				} else {
					items.push({
						kind: 'entry',
						change: 'added',
						blockKey,
						objectId: masterEntry.objectId
					});
				}
			}
			continue;
		}

		// Entry exists in both master and tailored, so diff items.
		if (tailoredEntry) {
			diffScalars(items, blockKey, parent, baselineEntry, masterEntry, tailoredEntry);
			onMatched?.(baselineEntry, masterEntry, tailoredEntry);
		}
		// tailoredEntry absent: user removed it from tailored, don't do anything about it.
	}
}

function sameValue(a: unknown, b: unknown): boolean {
	return a instanceof Date || b instanceof Date ? String(a) === String(b) : a === b;
}

function diffScalars<E extends WithId>(
	items: DiffItem[],
	blockKey: ListBlockKey,
	parent: NestedParent | undefined,
	baseline: E,
	master: E,
	tailored: E
): void {
	const before: Record<string, unknown> = {};
	const after: Record<string, unknown> = {};
	let changed = false;

	for (const key of Object.keys(master) as Array<keyof E & string>) {
		if (key === 'objectId') continue;
		if (Array.isArray(master[key])) continue; // nested lists are handled at diffList
		if (sameValue(baseline[key], master[key])) continue;
		if (sameValue(tailored[key], master[key])) continue;

		before[key] = tailored[key];
		after[key] = master[key];
		changed = true;
	}

	if (changed) {
		if (parent) {
			items.push({
				kind: 'nested',
				change: 'modified',
				blockKey,
				nestedListKey: parent.nestedListKey,
				parentObjectId: parent.objectId,
				objectId: master.objectId,
				before,
				after
			});
		} else {
			items.push({
				kind: 'entry',
				change: 'modified',
				blockKey,
				objectId: master.objectId,
				before,
				after
			});
		}
	}
}
