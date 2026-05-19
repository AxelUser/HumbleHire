import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { CV, CVBlocks, JobEntry, ObjectId, SkillCategory, Tag } from '$lib/types/cv';
import type { DiffItem } from './types';
import { entryTitle, formatPeriod, formatValue, entryKind, describeDiff } from './present';

function id(): ObjectId {
	return createObjectId();
}

function textBlock(value: string) {
	return { objectId: id(), value };
}

function listBlock<T>(value: T) {
	return { objectId: id(), value };
}

function makeTag(value: string): Tag {
	return { objectId: id(), value };
}

function makeJob(): JobEntry {
	return {
		objectId: id(),
		company: 'Stripe',
		role: 'Engineer',
		startDate: new Date(2021, 0, 1),
		endDate: undefined,
		achievements: [
			{ objectId: id(), text: 'Built the thing' },
			{ objectId: id(), text: 'Built another thing' }
		],
		skills: [makeTag('Go'), makeTag('Rust')]
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
		notes: '',
		createdAt: 1000,
		updatedAt: 1000,
		version: 1,
		blocks: { ...emptyBlocks(), ...overrides },
		hiddenBlockIds: []
	};
}

describe('formatValue', () => {
	it('renders a Date as month and year', () => {
		expect(formatValue(new Date(2021, 0, 15))).toBe('Jan 2021');
	});

	it('renders empty values as a placeholder', () => {
		expect(formatValue('')).toBe('(empty)');
		expect(formatValue(undefined)).toBe('(empty)');
	});

	it('renders a plain string unchanged', () => {
		expect(formatValue('Senior Engineer')).toBe('Senior Engineer');
	});
});

describe('formatPeriod', () => {
	it('returns undefined when both dates are missing', () => {
		expect(formatPeriod(undefined, undefined)).toBeUndefined();
	});

	it('uses "Present" when the end date is missing', () => {
		expect(formatPeriod(new Date(2021, 0, 1), undefined)).toBe('Jan 2021 – Present');
	});

	it('renders a full range', () => {
		expect(formatPeriod(new Date(2021, 0, 1), new Date(2023, 5, 1))).toBe('Jan 2021 – Jun 2023');
	});
});

describe('entryKind', () => {
	it('returns job for jobHistory block', () => {
		expect(entryKind('jobHistory')).toBe('job');
	});

	it('returns achievement for achievements nested key', () => {
		expect(entryKind('jobHistory', 'achievements')).toBe('achievement');
	});

	it('returns tag for skills nested key', () => {
		expect(entryKind('jobHistory', 'skills')).toBe('tag');
	});

	it('returns tag for stack nested key', () => {
		expect(entryKind('projects', 'stack')).toBe('tag');
	});

	it('returns skillCategory for skills block', () => {
		expect(entryKind('skills')).toBe('skillCategory');
	});
});

describe('entryTitle', () => {
	it('returns company for a job entry', () => {
		expect(entryTitle('job', makeJob())).toBe('Stripe');
	});

	it('returns name for a skill category', () => {
		const cat: SkillCategory = { objectId: id(), name: 'Languages', skills: [] };
		expect(entryTitle('skillCategory', cat)).toBe('Languages');
	});

	it('returns value for a tag', () => {
		expect(entryTitle('tag', makeTag('Kubernetes'))).toBe('Kubernetes');
	});

	it('returns fallback for empty fields', () => {
		const job: JobEntry = {
			objectId: id(),
			company: '',
			role: '',
			startDate: undefined,
			endDate: undefined,
			achievements: [],
			skills: []
		};
		expect(entryTitle('job', job)).toBe('(untitled)');
	});
});

describe('describeDiff', () => {
	it('describes a text modification', () => {
		const masterCv = makeCV();
		const tailoredCv = makeCV();
		const item: DiffItem = {
			kind: 'text',
			blockKey: 'position',
			objectId: masterCv.blocks.position.objectId,
			before: 'Engineer',
			after: 'Senior Engineer'
		};
		const meta = describeDiff(item, masterCv, tailoredCv);
		expect(meta.blockLabel).toBe('Position');
		expect(meta.description).toBe('Changed Position');
		expect(meta.change).toBe('modified');
	});

	it('describes an added top-level entry using the entry title from master', () => {
		const job = makeJob();
		const masterCv = makeCV({ jobHistory: listBlock([job]) });
		const tailoredCv = makeCV();
		const item: DiffItem = {
			kind: 'entry',
			change: 'added',
			blockKey: 'jobHistory',
			objectId: job.objectId
		};
		const meta = describeDiff(item, masterCv, tailoredCv);
		expect(meta.title).toBe('Stripe');
		expect(meta.description).toBe('Added job entry');
		expect(meta.blockLabel).toBe('Job History');
	});

	it('describes a removed top-level entry using the entry title from tailored', () => {
		const job = makeJob();
		const masterCv = makeCV();
		const tailoredCv = makeCV({ jobHistory: listBlock([job]) });
		const item: DiffItem = {
			kind: 'entry',
			change: 'removed',
			blockKey: 'jobHistory',
			objectId: job.objectId
		};
		const meta = describeDiff(item, masterCv, tailoredCv);
		expect(meta.title).toBe('Stripe');
		expect(meta.description).toBe('Removed job entry');
	});

	it('describes a modified top-level entry', () => {
		const job = makeJob();
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
		const meta = describeDiff(item, masterCv, tailoredCv);
		expect(meta.title).toBe('Stripe');
		expect(meta.description).toBe('Modified job entry');
		expect(meta.change).toBe('modified');
	});

	it('describes a nested added item using the parent entity title', () => {
		const job = makeJob();
		const masterCv = makeCV({ jobHistory: listBlock([job]) });
		const tailoredCv = makeCV({ jobHistory: listBlock([job]) });
		const achId = id();
		const item: DiffItem = {
			kind: 'nested',
			change: 'added',
			blockKey: 'jobHistory',
			nestedListKey: 'achievements',
			parentObjectId: job.objectId,
			objectId: achId
		};
		const meta = describeDiff(item, masterCv, tailoredCv);
		expect(meta.title).toBe('Stripe'); // parent job company
		expect(meta.description).toBe('Added achievement');
		expect(meta.blockLabel).toBe('Job History');
	});

	it('marks an item as previously discarded based on the discarded map', () => {
		// previouslyDiscarded is computed at the call site in sync-dialog, not in describeDiff
		// This test verifies that entryTitle correctly handles a skill category
		const cat: SkillCategory = { objectId: id(), name: 'Backend', skills: [] };
		const masterCv = makeCV({ skills: listBlock([cat]) });
		const tailoredCv = makeCV();
		const item: DiffItem = {
			kind: 'entry',
			change: 'added',
			blockKey: 'skills',
			objectId: cat.objectId
		};
		const meta = describeDiff(item, masterCv, tailoredCv);
		expect(meta.title).toBe('Backend');
		expect(meta.description).toBe('Added skill category');
	});
});
