import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { JobEntry, ObjectId, SkillCategory, Tag } from '$lib/types/cv';
import type { DiffItem } from './types';
import { entryPreview, formatPeriod, formatValue, toViewItem } from './present';

function id(): ObjectId {
	return createObjectId();
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

describe('entryPreview', () => {
	it('summarises a job entry with subtitle, bullets and tags', () => {
		const preview = entryPreview('jobHistory', undefined, makeJob());
		expect(preview.title).toBe('Stripe');
		expect(preview.subtitle).toBe('Engineer · Jan 2021 – Present');
		expect(preview.bullets).toEqual(['Built the thing', 'Built another thing']);
		expect(preview.tags).toEqual(['Go', 'Rust']);
	});

	it('summarises a skill category by name and tags', () => {
		const category: SkillCategory = {
			objectId: id(),
			name: 'Languages',
			skills: [makeTag('Go')]
		};
		const preview = entryPreview('skills', undefined, category);
		expect(preview.title).toBe('Languages');
		expect(preview.tags).toEqual(['Go']);
	});

	it('summarises a nested tag by its value', () => {
		const preview = entryPreview('jobHistory', 'skills', makeTag('Kubernetes'));
		expect(preview.title).toBe('Kubernetes');
	});

	it('summarises a nested achievement by its text', () => {
		const preview = entryPreview('jobHistory', 'achievements', {
			objectId: id(),
			text: 'Shipped it'
		});
		expect(preview.title).toBe('Shipped it');
	});
});

describe('toViewItem', () => {
	it('builds a single field change for a text modification', () => {
		const item: DiffItem = {
			type: 'textModified',
			blockKey: 'position',
			objectId: id(),
			before: 'Engineer',
			after: 'Senior Engineer'
		};
		const view = toViewItem(item, {});
		expect(view.description).toBe('Changed Position');
		expect(view.fields).toEqual([
			{ label: 'Position', before: 'Engineer', after: 'Senior Engineer' }
		]);
		expect(view.preview).toBeUndefined();
	});

	it('builds a preview for an added entry', () => {
		const job = makeJob();
		const item: DiffItem = {
			type: 'entryAdded',
			blockKey: 'jobHistory',
			objectId: job.objectId,
			entry: job
		};
		const view = toViewItem(item, {});
		expect(view.description).toBe('Added job entry — Stripe');
		expect(view.preview?.title).toBe('Stripe');
		expect(view.fields).toBeUndefined();
	});

	it('uses the nested noun for an added nested entry', () => {
		const item: DiffItem = {
			type: 'entryAdded',
			blockKey: 'jobHistory',
			objectId: id(),
			parentObjectId: id(),
			nestedListKey: 'achievements',
			entry: { objectId: id(), text: 'Did a thing' }
		};
		const view = toViewItem(item, {});
		expect(view.description).toBe('Added achievement — Did a thing');
	});

	it('builds per-field changes for a modified entry, formatting dates', () => {
		const job = makeJob();
		const item: DiffItem = {
			type: 'entryModified',
			blockKey: 'jobHistory',
			objectId: job.objectId,
			entry: job,
			before: { role: 'Engineer', endDate: undefined },
			after: { role: 'Senior Engineer', endDate: new Date(2023, 5, 1) }
		};
		const view = toViewItem(item, {});
		expect(view.description).toBe('Changed Stripe');
		expect(view.fields).toEqual([
			{ label: 'Role', before: 'Engineer', after: 'Senior Engineer' },
			{ label: 'End date', before: '(empty)', after: 'Jun 2023' }
		]);
	});

	it('marks an item as previously discarded', () => {
		const objectId = id();
		const item: DiffItem = {
			type: 'textModified',
			blockKey: 'position',
			objectId,
			before: 'a',
			after: 'b'
		};
		const view = toViewItem(item, { [objectId]: 4 });
		expect(view.previouslyDiscarded).toBe(true);
	});
});
