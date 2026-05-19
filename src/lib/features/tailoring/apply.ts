import type {
	CV,
	ObjectId,
	JobEntry,
	ProjectEntry,
	SkillCategory,
	Achievement,
	Tag,
	EducationEntry,
	Highlight,
	ContactEntry
} from '$lib/types/cv';
import { diffCVs } from './diff';
import type { DiffItem } from './types';

function applyItem(tailored: CV, item: DiffItem): void {
	const blocks = tailored.blocks;

	switch (item.type) {
		case 'textModified': {
			const block = blocks[item.blockKey];
			block.value = item.after;
			break;
		}

		case 'entryAdded': {
			if (item.parentObjectId) {
				applyNestedEntryAdded(blocks, item);
			} else {
				applyTopLevelEntryAdded(blocks, item);
			}
			break;
		}

		case 'entryRemoved': {
			if (item.parentObjectId) {
				applyNestedEntryRemoved(blocks, item);
			} else {
				applyTopLevelEntryRemoved(blocks, item);
			}
			break;
		}

		case 'entryModified': {
			if (item.parentObjectId) {
				applyNestedEntryModified(blocks, item);
			} else {
				applyTopLevelEntryModified(blocks, item);
			}
			break;
		}
	}
}

function applyTopLevelEntryAdded(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryAdded' }>
): void {
	const entry = structuredClone(item.entry);
	switch (item.blockKey) {
		case 'contacts':
			blocks.contacts.value.push(entry as ContactEntry);
			break;
		case 'highlights':
			blocks.highlights.value.push(entry as Highlight);
			break;
		case 'skills':
			blocks.skills.value.push(entry as SkillCategory);
			break;
		case 'jobHistory':
			blocks.jobHistory.value.push(entry as JobEntry);
			break;
		case 'projects':
			blocks.projects.value.push(entry as ProjectEntry);
			break;
		case 'education':
			blocks.education.value.push(entry as EducationEntry);
			break;
	}
}

function applyTopLevelEntryRemoved(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryRemoved' }>
): void {
	const removeById = <T extends { objectId: ObjectId }>(arr: T[]): T[] =>
		arr.filter((e) => e.objectId !== item.objectId);

	switch (item.blockKey) {
		case 'contacts':
			blocks.contacts.value = removeById(blocks.contacts.value);
			break;
		case 'highlights':
			blocks.highlights.value = removeById(blocks.highlights.value);
			break;
		case 'skills':
			blocks.skills.value = removeById(blocks.skills.value);
			break;
		case 'jobHistory':
			blocks.jobHistory.value = removeById(blocks.jobHistory.value);
			break;
		case 'projects':
			blocks.projects.value = removeById(blocks.projects.value);
			break;
		case 'education':
			blocks.education.value = removeById(blocks.education.value);
			break;
	}
}

function applyTopLevelEntryModified(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryModified' }>
): void {
	const applyFields = <T extends { objectId: ObjectId }>(arr: T[]): void => {
		const entry = arr.find((e) => e.objectId === item.objectId);
		if (entry) Object.assign(entry, item.after);
	};

	switch (item.blockKey) {
		case 'contacts':
			applyFields(blocks.contacts.value);
			break;
		case 'highlights':
			applyFields(blocks.highlights.value);
			break;
		case 'skills':
			applyFields(blocks.skills.value);
			break;
		case 'jobHistory':
			applyFields(blocks.jobHistory.value);
			break;
		case 'projects':
			applyFields(blocks.projects.value);
			break;
		case 'education':
			applyFields(blocks.education.value);
			break;
	}
}

function applyNestedEntryAdded(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryAdded' }>
): void {
	const parentId = item.parentObjectId!;
	const entry = structuredClone(item.entry);

	if (item.nestedListKey === 'achievements') {
		const job = blocks.jobHistory.value.find((j) => j.objectId === parentId);
		if (job) job.achievements.push(entry as Achievement);
	} else if (item.nestedListKey === 'stack') {
		const proj = blocks.projects.value.find((p) => p.objectId === parentId);
		if (proj) proj.stack.push(entry as Tag);
	} else if (item.nestedListKey === 'skills') {
		if (item.blockKey === 'jobHistory') {
			const job = blocks.jobHistory.value.find((j) => j.objectId === parentId);
			if (job) job.skills.push(entry as Tag);
		} else {
			const cat = blocks.skills.value.find((c) => c.objectId === parentId);
			if (cat) cat.skills.push(entry as Tag);
		}
	}
}

function applyNestedEntryRemoved(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryRemoved' }>
): void {
	const parentId = item.parentObjectId!;
	const removeById = <T extends { objectId: ObjectId }>(arr: T[]): T[] =>
		arr.filter((e) => e.objectId !== item.objectId);

	if (item.nestedListKey === 'achievements') {
		const job = blocks.jobHistory.value.find((j) => j.objectId === parentId);
		if (job) job.achievements = removeById(job.achievements);
	} else if (item.nestedListKey === 'stack') {
		const proj = blocks.projects.value.find((p) => p.objectId === parentId);
		if (proj) proj.stack = removeById(proj.stack);
	} else if (item.nestedListKey === 'skills') {
		if (item.blockKey === 'jobHistory') {
			const job = blocks.jobHistory.value.find((j) => j.objectId === parentId);
			if (job) job.skills = removeById(job.skills);
		} else {
			const cat = blocks.skills.value.find((c) => c.objectId === parentId);
			if (cat) cat.skills = removeById(cat.skills);
		}
	}
}

function applyNestedEntryModified(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryModified' }>
): void {
	const parentId = item.parentObjectId!;
	const applyTo = <T extends { objectId: ObjectId }>(arr: T[]): void => {
		const entry = arr.find((e) => e.objectId === item.objectId);
		if (entry) Object.assign(entry, item.after);
	};

	if (item.nestedListKey === 'achievements') {
		const job = blocks.jobHistory.value.find((j) => j.objectId === parentId);
		if (job) applyTo(job.achievements);
	} else if (item.nestedListKey === 'stack') {
		const proj = blocks.projects.value.find((p) => p.objectId === parentId);
		if (proj) applyTo(proj.stack);
	} else if (item.nestedListKey === 'skills') {
		if (item.blockKey === 'jobHistory') {
			const job = blocks.jobHistory.value.find((j) => j.objectId === parentId);
			if (job) applyTo(job.skills);
		} else {
			const cat = blocks.skills.value.find((c) => c.objectId === parentId);
			if (cat) applyTo(cat.skills);
		}
	}
}

export function applySyncDecisions(
	tailoredCv: CV,
	masterCv: CV,
	decisions: Map<ObjectId, 'accepted' | 'discarded'>
): void {
	const items = diffCVs(masterCv, tailoredCv);

	for (const item of items) {
		if (decisions.get(item.objectId) === 'accepted') {
			applyItem(tailoredCv, item);
		}
	}

	const syncDecisions = tailoredCv.syncDecisions ?? {
		sourceSyncedVersion: 0,
		discarded: {}
	};

	for (const item of items) {
		const decision = decisions.get(item.objectId);
		if (decision === 'discarded') {
			syncDecisions.discarded[item.objectId] = masterCv.version;
		} else if (decision === 'accepted') {
			delete syncDecisions.discarded[item.objectId];
		}
	}

	// Prune stale discards
	for (const [id, version] of Object.entries(syncDecisions.discarded)) {
		if (version < masterCv.version) {
			delete syncDecisions.discarded[id];
		}
	}

	const allResolved = items.every((item) => decisions.has(item.objectId));
	if (allResolved) {
		syncDecisions.sourceSyncedVersion = masterCv.version;
		tailoredCv.syncBaseline = structuredClone(masterCv.blocks);
	}

	tailoredCv.syncDecisions = syncDecisions;
}
