import {
	createObjectId,
	type Achievement,
	type CV,
	type CVBlocks,
	type JobEntry,
	type ObjectId,
	type Tag,
	type Highlight,
	type ProjectEntry,
	type SkillCategory,
	type ContactEntry,
	type EducationEntry
} from '$lib/types/cv';
import { computeBlockHashes } from './hash';

export function id(): ObjectId {
	return createObjectId();
}

export function textBlock(value: string) {
	return { objectId: id(), value };
}

export function listBlock<T>(value: T) {
	return { objectId: id(), value };
}

export function makeJob(company: string, role: string): JobEntry {
	return {
		objectId: id(),
		company,
		role,
		startDate: undefined,
		endDate: undefined,
		current: false,
		achievements: [],
		skills: []
	};
}

export function makeAchievement(text: string): Achievement {
	return { objectId: id(), text };
}

export function makeTag(value: string): Tag {
	return { objectId: id(), value };
}

export function makeHighlight(text: string): Highlight {
	return { objectId: id(), text };
}

export function makeProject(name: string): ProjectEntry {
	return { objectId: id(), name, description: '', stack: [], link: '' };
}

export function makeSkillCategory(name: string): SkillCategory {
	return { objectId: id(), name, skills: [] };
}

export function makeContact(label: string, value: string): ContactEntry {
	return { objectId: id(), label, value };
}

export function makeEducation(institution: string, degree: string): EducationEntry {
	return {
		objectId: id(),
		institution,
		degree,
		startDate: undefined,
		endDate: undefined,
		current: false
	};
}

export function emptyBlocks(): CVBlocks {
	return {
		fullName: textBlock('John Doe'),
		position: textBlock('Engineer'),
		location: textBlock('NYC'),
		contacts: listBlock([]),
		highlights: listBlock([]),
		skills: listBlock([]),
		jobHistory: listBlock([]),
		projects: listBlock([]),
		education: listBlock([])
	};
}

export function makeMaster(overrides?: Partial<CVBlocks>, cvOverrides?: Partial<CV>): CV {
	const blocks = { ...emptyBlocks(), ...overrides };
	return {
		id: 'master-1',
		name: 'Master CV',
		createdAt: 1000,
		updatedAt: 1000,
		blocks,
		blockHashes: computeBlockHashes(blocks),
		hiddenBlockIds: [],
		...cvOverrides
	};
}

export function makeTailored(master: CV, overrides?: Partial<CV>): CV {
	const blocks = structuredClone(master.blocks);
	return {
		id: 'tailored-1',
		name: 'Tailored CV',
		createdAt: 2000,
		updatedAt: 2000,
		blocks,
		blockHashes: { ...master.blockHashes },
		hiddenBlockIds: [...master.hiddenBlockIds],
		sourceId: master.id,
		syncBaseline: structuredClone(master.blocks),
		syncBaselineHashes: { ...master.blockHashes },
		...overrides
	};
}
