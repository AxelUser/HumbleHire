import type { CV, ObjectId, TextBlock } from '$lib/types/cv';
import type { DiffItem } from './types';
import { DiffRoot, EntryBuilder, ListBuilder, TextBlockBuilder } from './diff-builder';
import type { ListBlockKey } from '$lib/types/cv';

export function diffCVs(master: CV, tailored: CV): DiffItem[] {
	const root = new DiffRoot();
	const hidden = new Set(master.hiddenBlockIds);
	const visible = (id: ObjectId) => !hidden.has(id);
	const baseline = tailored.syncBaseline ?? master.blocks; // baseline is the master CV version at the time of tailoring

	for (const key of ['fullName', 'position', 'location'] as const) {
		if (visible(master.blocks[key].objectId)) {
			diffText(root.atBlock(key), baseline[key], master.blocks[key], tailored.blocks[key]);
		}
	}

	if (visible(master.blocks.contactsBlockId)) {
		diffList(
			root.atBlock('contacts'),
			baseline.contacts,
			master.blocks.contacts,
			tailored.blocks.contacts
		);
	}
	if (visible(master.blocks.highlightsBlockId)) {
		diffList(
			root.atBlock('highlights'),
			baseline.highlights,
			master.blocks.highlights,
			tailored.blocks.highlights
		);
	}
	if (visible(master.blocks.educationBlockId)) {
		diffList(
			root.atBlock('education'),
			baseline.education,
			master.blocks.education,
			tailored.blocks.education
		);
	}

	if (visible(master.blocks.skillsBlockId)) {
		diffList(
			root.atBlock('skills'),
			baseline.skills,
			master.blocks.skills,
			tailored.blocks.skills,
			(b, m, t, eb) => {
				diffList(eb.atList('skills'), b.skills, m.skills, t.skills);
			}
		);
	}
	if (visible(master.blocks.jobHistoryBlockId)) {
		diffList(
			root.atBlock('jobHistory'),
			baseline.jobHistory,
			master.blocks.jobHistory,
			tailored.blocks.jobHistory,
			(b, m, t, eb) => {
				diffList(eb.atList('achievements'), b.achievements, m.achievements, t.achievements);
				diffList(eb.atList('skills'), b.skills, m.skills, t.skills);
			}
		);
	}
	if (visible(master.blocks.projectsBlockId)) {
		diffList(
			root.atBlock('projects'),
			baseline.projects,
			master.blocks.projects,
			tailored.blocks.projects,
			(b, m, t, eb) => {
				diffList(eb.atList('stack'), b.stack, m.stack, t.stack);
			}
		);
	}

	return root.items;
}

function diffText(
	builder: TextBlockBuilder,
	baseline: TextBlock,
	master: TextBlock,
	tailored: TextBlock
): void {
	if (baseline.value === master.value || tailored.value === master.value) return;
	builder.modified(master.objectId, tailored.value, master.value);
}

function diffList<K extends ListBlockKey, E extends { objectId: ObjectId }>(
	builder: ListBuilder<K, E>,
	baseline: E[],
	master: E[],
	tailored: E[],
	onMatched?: (b: E, m: E, t: E, eb: EntryBuilder<K, E>) => void
): void {
	const baselineMap = new Map(baseline.map((e) => [e.objectId, e]));
	const masterMap = new Map(master.map((e) => [e.objectId, e]));
	const tailoredMap = new Map(tailored.map((e) => [e.objectId, e]));

	// In baseline but not in master: master deleted it, surface if tailored still has it.
	for (const baselineEntry of baseline) {
		if (!masterMap.has(baselineEntry.objectId) && tailoredMap.has(baselineEntry.objectId)) {
			builder.entryRemoved(baselineEntry);
		}
	}

	for (const masterEntry of master) {
		const baselineEntry = baselineMap.get(masterEntry.objectId);
		const tailoredEntry = tailoredMap.get(masterEntry.objectId);

		if (!baselineEntry) {
			// Not in baseline: master added it after tailoring.
			if (!tailoredEntry) builder.entryAdded(masterEntry);
			continue;
		}

		// Entry exists in both master and tailored, so diff items.
		if (tailoredEntry) {
			const eb = builder.atEntry(masterEntry);
			diffScalars(eb, baselineEntry, masterEntry, tailoredEntry);
			onMatched?.(baselineEntry, masterEntry, tailoredEntry, eb);
		}
		// tailoredEntry absent: user removed it from tailored, don't do anything about it.
	}
}

function sameValue(a: unknown, b: unknown): boolean {
	return a instanceof Date || b instanceof Date ? String(a) === String(b) : a === b;
}

function diffScalars<K extends ListBlockKey, E extends { objectId: ObjectId }>(
	builder: EntryBuilder<K, E>,
	baseline: E,
	master: E,
	tailored: E
): void {
	const scalarBefore: Partial<E> = {};
	const scalarAfter: Partial<E> = {};
	let changed = false;

	for (const key of Object.keys(master) as Array<keyof E & string>) {
		if (key === 'objectId') continue;
		if (Array.isArray(master[key])) continue;
		if (sameValue(baseline[key], master[key])) continue;
		if (sameValue(tailored[key], master[key])) continue;

		scalarBefore[key] = tailored[key];
		scalarAfter[key] = master[key];
		changed = true;
	}

	if (changed) {
		builder.modified(scalarBefore, scalarAfter);
	}
}
