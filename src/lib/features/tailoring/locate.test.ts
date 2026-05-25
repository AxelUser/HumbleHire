import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { CV, CVBlocks, JobEntry, ObjectId, SkillCategory } from '$lib/types/cv';
import type { DiffItem } from './types';
import {
	findEntry,
	findNestedEntry,
	findParentEntry,
	resolveDiffEntry,
	resolveParentEntry
} from './locate';

function id(): ObjectId {
	return createObjectId();
}

function textBlock(value: string) {
	return { objectId: id(), value };
}

function listBlock<T>(value: T) {
	return { objectId: id(), value };
}

function makeJob(company: string): JobEntry {
	return {
		objectId: id(),
		company,
		role: 'Engineer',
		startDate: undefined,
		endDate: undefined,
		achievements: [],
		skills: []
	};
}

function emptyBlocks(): CVBlocks {
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

function makeCV(overrides?: Partial<CVBlocks>): CV {
	return {
		id: 'cv-1',
		name: 'CV',
		createdAt: 1000,
		updatedAt: 1000,
		version: 1,
		blocks: { ...emptyBlocks(), ...overrides },
		hiddenBlockIds: []
	};
}

describe('findEntry', () => {
	it('finds an entry by objectId', () => {
		const job = makeJob('Acme');
		const blocks = { ...emptyBlocks(), jobHistory: listBlock([job]) };
		expect(findEntry(blocks, 'jobHistory', job.objectId)).toEqual(job);
	});

	it('returns undefined when the entry does not exist', () => {
		const blocks = emptyBlocks();
		expect(findEntry(blocks, 'jobHistory', id())).toBeUndefined();
	});
});

describe('findParentEntry', () => {
	it('finds a parent entry in the correct block', () => {
		const job = makeJob('Stripe');
		const blocks = { ...emptyBlocks(), jobHistory: listBlock([job]) };
		expect(findParentEntry(blocks, 'jobHistory', job.objectId)).toEqual(job);
	});
});

describe('findNestedEntry', () => {
	it('finds a nested achievement inside a job', () => {
		const ach = { objectId: id(), text: 'Built it' };
		const job = makeJob('Acme');
		job.achievements.push(ach);
		const blocks = { ...emptyBlocks(), jobHistory: listBlock([job]) };
		expect(
			findNestedEntry(blocks, 'jobHistory', job.objectId, 'achievements', ach.objectId)
		).toEqual(ach);
	});

	it('returns undefined when parent does not exist', () => {
		const blocks = emptyBlocks();
		expect(findNestedEntry(blocks, 'jobHistory', id(), 'achievements', id())).toBeUndefined();
	});

	it('returns undefined when nested item does not exist', () => {
		const job = makeJob('Acme');
		const blocks = { ...emptyBlocks(), jobHistory: listBlock([job]) };
		expect(
			findNestedEntry(blocks, 'jobHistory', job.objectId, 'achievements', id())
		).toBeUndefined();
	});

	it('finds a nested skill inside a skill category', () => {
		const skill = { objectId: id(), value: 'TypeScript' };
		const cat: SkillCategory = { objectId: id(), name: 'Languages', skills: [skill] };
		const blocks = { ...emptyBlocks(), skills: listBlock([cat]) };
		expect(findNestedEntry(blocks, 'skills', cat.objectId, 'skills', skill.objectId)).toEqual(
			skill
		);
	});
});

describe('resolveDiffEntry', () => {
	it('resolves an added entry from master', () => {
		const job = makeJob('Acme');
		const masterCv = makeCV({ jobHistory: listBlock([job]) });
		const tailoredCv = makeCV();
		const item: DiffItem = {
			kind: 'entry',
			change: 'added',
			blockKey: 'jobHistory',
			objectId: job.objectId
		};
		expect(resolveDiffEntry(item, masterCv, tailoredCv)).toEqual(job);
	});

	it('resolves a removed entry from tailored', () => {
		const job = makeJob('Acme');
		const masterCv = makeCV();
		const tailoredCv = makeCV({ jobHistory: listBlock([job]) });
		const item: DiffItem = {
			kind: 'entry',
			change: 'removed',
			blockKey: 'jobHistory',
			objectId: job.objectId
		};
		expect(resolveDiffEntry(item, masterCv, tailoredCv)).toEqual(job);
	});

	it('resolves a modified entry from master', () => {
		const job = makeJob('Acme');
		const masterCv = makeCV({ jobHistory: listBlock([job]) });
		const tailoredCv = makeCV();
		const item: DiffItem = {
			kind: 'entry',
			change: 'modified',
			blockKey: 'jobHistory',
			objectId: job.objectId,
			before: { role: 'Engineer' },
			after: { role: 'Senior Engineer' }
		};
		expect(resolveDiffEntry(item, masterCv, tailoredCv)).toEqual(job);
	});

	it('returns undefined for text items', () => {
		const masterCv = makeCV();
		const tailoredCv = makeCV();
		const item: DiffItem = {
			kind: 'text',
			blockKey: 'position',
			objectId: masterCv.blocks.position.objectId,
			before: 'a',
			after: 'b'
		};
		expect(resolveDiffEntry(item, masterCv, tailoredCv)).toBeUndefined();
	});

	it('resolves a nested added item from master', () => {
		const ach = { objectId: id(), text: 'Built it' };
		const job = makeJob('Acme');
		job.achievements.push(ach);
		const masterCv = makeCV({ jobHistory: listBlock([job]) });
		const tailoredCv = makeCV();
		const item: DiffItem = {
			kind: 'nested',
			change: 'added',
			blockKey: 'jobHistory',
			nestedListKey: 'achievements',
			parentObjectId: job.objectId,
			objectId: ach.objectId
		};
		expect(resolveDiffEntry(item, masterCv, tailoredCv)).toEqual(ach);
	});
});

describe('resolveParentEntry', () => {
	it('resolves parent from master for a nested item', () => {
		const job = makeJob('Stripe');
		const masterCv = makeCV({ jobHistory: listBlock([job]) });
		const tailoredCv = makeCV({ jobHistory: listBlock([job]) });
		const item = {
			kind: 'nested' as const,
			change: 'added' as const,
			blockKey: 'jobHistory' as const,
			nestedListKey: 'achievements' as const,
			parentObjectId: job.objectId,
			objectId: id()
		};
		const parent = resolveParentEntry(item, masterCv, tailoredCv);
		expect((parent as JobEntry)?.company).toBe('Stripe');
	});

	it('falls back to tailored when parent not in master', () => {
		const job = makeJob('Stripe');
		const masterCv = makeCV();
		const tailoredCv = makeCV({ jobHistory: listBlock([job]) });
		const item = {
			kind: 'nested' as const,
			change: 'removed' as const,
			blockKey: 'jobHistory' as const,
			nestedListKey: 'achievements' as const,
			parentObjectId: job.objectId,
			objectId: id()
		};
		const parent = resolveParentEntry(item, masterCv, tailoredCv);
		expect((parent as JobEntry)?.company).toBe('Stripe');
	});
});
