import type { CV, ObjectId, JobEntry, ProjectEntry, SkillCategory, Achievement, Tag } from '$lib/types/cv';
import { CollectingDiffBuilder, diffCVs } from './diff';
import type { DiffItem } from './types';

function applyItem(tailored: CV, masterCv: CV, item: DiffItem): void {
	const blocks = tailored.blocks;

	switch (item.type) {
		case 'textModified': {
			const block = blocks[item.blockKey as 'fullName' | 'position' | 'location'];
			if (block && typeof block === 'object' && 'value' in block) {
				block.value = item.after;
			}
			break;
		}

		case 'entryAdded': {
			if (item.parentObjectId) {
				applyNestedEntryAdded(blocks, item);
			} else {
				applyTopLevelEntryAdded(blocks, item, masterCv);
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

		case 'childrenReordered': {
			applyChildrenReordered(blocks, item);
			break;
		}
	}
}

function applyTopLevelEntryAdded(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryAdded' }>,
	masterCv: CV
): void {
	const entry = structuredClone(item.entry);
	switch (item.blockKey) {
		case 'contacts':
			blocks.contacts.push(entry as CV['blocks']['contacts'][0]);
			break;
		case 'highlights':
			blocks.highlights.push(entry as CV['blocks']['highlights'][0]);
			break;
		case 'skills': {
			const masterEntry = masterCv.blocks.skills.find(
				(s) => s.objectId === (entry as { objectId: ObjectId }).objectId
			);
			blocks.skills.push(structuredClone(masterEntry ?? entry) as SkillCategory);
			break;
		}
		case 'jobHistory': {
			const masterEntry = masterCv.blocks.jobHistory.find(
				(j) => j.objectId === (entry as { objectId: ObjectId }).objectId
			);
			blocks.jobHistory.push(structuredClone(masterEntry ?? entry) as JobEntry);
			break;
		}
		case 'projects': {
			const masterEntry = masterCv.blocks.projects.find(
				(p) => p.objectId === (entry as { objectId: ObjectId }).objectId
			);
			blocks.projects.push(structuredClone(masterEntry ?? entry) as ProjectEntry);
			break;
		}
		case 'education':
			blocks.education.push(entry as CV['blocks']['education'][0]);
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
		case 'contacts': blocks.contacts = removeById(blocks.contacts); break;
		case 'highlights': blocks.highlights = removeById(blocks.highlights); break;
		case 'skills': blocks.skills = removeById(blocks.skills); break;
		case 'jobHistory': blocks.jobHistory = removeById(blocks.jobHistory); break;
		case 'projects': blocks.projects = removeById(blocks.projects); break;
		case 'education': blocks.education = removeById(blocks.education); break;
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
		case 'contacts': applyFields(blocks.contacts); break;
		case 'highlights': applyFields(blocks.highlights); break;
		case 'skills': applyFields(blocks.skills); break;
		case 'jobHistory': applyFields(blocks.jobHistory); break;
		case 'projects': applyFields(blocks.projects); break;
		case 'education': applyFields(blocks.education); break;
	}
}

function applyNestedEntryAdded(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryAdded' }>
): void {
	const parentId = item.parentObjectId!;
	const entry = structuredClone(item.entry);

	if (item.blockKey === 'jobHistory') {
		const job = blocks.jobHistory.find((j) => j.objectId === parentId);
		if (!job) return;
		const asAchievement = entry as Achievement;
		if ('text' in asAchievement) {
			job.achievements.push(asAchievement);
		} else {
			job.skills.push(entry as Tag);
		}
	} else if (item.blockKey === 'skills') {
		const cat = blocks.skills.find((c) => c.objectId === parentId);
		if (cat) cat.skills.push(entry as Tag);
	} else if (item.blockKey === 'projects') {
		const proj = blocks.projects.find((p) => p.objectId === parentId);
		if (proj) proj.stack.push(entry as Tag);
	}
}

function applyNestedEntryRemoved(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryRemoved' }>
): void {
	const parentId = item.parentObjectId!;
	const removeById = <T extends { objectId: ObjectId }>(arr: T[]): T[] =>
		arr.filter((e) => e.objectId !== item.objectId);

	if (item.blockKey === 'jobHistory') {
		const job = blocks.jobHistory.find((j) => j.objectId === parentId);
		if (!job) return;
		job.achievements = removeById(job.achievements);
		job.skills = removeById(job.skills);
	} else if (item.blockKey === 'skills') {
		const cat = blocks.skills.find((c) => c.objectId === parentId);
		if (cat) cat.skills = removeById(cat.skills);
	} else if (item.blockKey === 'projects') {
		const proj = blocks.projects.find((p) => p.objectId === parentId);
		if (proj) proj.stack = removeById(proj.stack);
	}
}

function applyNestedEntryModified(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'entryModified' }>
): void {
	const parentId = item.parentObjectId!;

	if (item.blockKey === 'jobHistory') {
		const job = blocks.jobHistory.find((j) => j.objectId === parentId);
		if (!job) return;
		const ach = job.achievements.find((a) => a.objectId === item.objectId);
		if (ach) Object.assign(ach, item.after);
		const skill = job.skills.find((s) => s.objectId === item.objectId);
		if (skill) Object.assign(skill, item.after);
	} else if (item.blockKey === 'skills') {
		const cat = blocks.skills.find((c) => c.objectId === parentId);
		if (!cat) return;
		const skill = cat.skills.find((s) => s.objectId === item.objectId);
		if (skill) Object.assign(skill, item.after);
	} else if (item.blockKey === 'projects') {
		const proj = blocks.projects.find((p) => p.objectId === parentId);
		if (!proj) return;
		const tag = proj.stack.find((t) => t.objectId === item.objectId);
		if (tag) Object.assign(tag, item.after);
	}
}

function applyChildrenReordered(
	blocks: CV['blocks'],
	item: Extract<DiffItem, { type: 'childrenReordered' }>
): void {
	const reorder = <T extends { objectId: ObjectId }>(arr: T[], newOrder: ObjectId[]): T[] => {
		const map = new Map(arr.map((e) => [e.objectId, e]));
		const reordered = newOrder.map((id) => map.get(id)).filter(Boolean) as T[];
		const remaining = arr.filter((e) => !newOrder.includes(e.objectId));
		return [...reordered, ...remaining];
	};

	if (item.parentObjectId) {
		const parentId = item.parentObjectId;
		if (item.blockKey === 'jobHistory') {
			const job = blocks.jobHistory.find((j) => j.objectId === parentId);
			if (job) {
				job.achievements = reorder(job.achievements, item.afterIds);
				job.skills = reorder(job.skills, item.afterIds);
			}
		} else if (item.blockKey === 'skills') {
			const cat = blocks.skills.find((c) => c.objectId === parentId);
			if (cat) cat.skills = reorder(cat.skills, item.afterIds);
		} else if (item.blockKey === 'projects') {
			const proj = blocks.projects.find((p) => p.objectId === parentId);
			if (proj) proj.stack = reorder(proj.stack, item.afterIds);
		}
	} else {
		switch (item.blockKey) {
			case 'contacts': blocks.contacts = reorder(blocks.contacts, item.afterIds); break;
			case 'highlights': blocks.highlights = reorder(blocks.highlights, item.afterIds); break;
			case 'skills': blocks.skills = reorder(blocks.skills, item.afterIds); break;
			case 'jobHistory': blocks.jobHistory = reorder(blocks.jobHistory, item.afterIds); break;
			case 'projects': blocks.projects = reorder(blocks.projects, item.afterIds); break;
			case 'education': blocks.education = reorder(blocks.education, item.afterIds); break;
		}
	}
}

export function applySyncDecisions(
	tailoredCv: CV,
	masterCv: CV,
	decisions: Map<ObjectId, 'accepted' | 'discarded'>
): void {
	const builder = new CollectingDiffBuilder();
	diffCVs(masterCv, tailoredCv, builder);
	const items = builder.items;

	for (const item of items) {
		if (decisions.get(item.objectId) === 'accepted') {
			applyItem(tailoredCv, masterCv, item);
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

	const allResolved = items.every(
		(item) => decisions.has(item.objectId)
	);
	if (allResolved) {
		syncDecisions.sourceSyncedVersion = masterCv.version;
	}

	tailoredCv.syncDecisions = syncDecisions;
}
