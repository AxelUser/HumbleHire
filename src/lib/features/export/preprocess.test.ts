import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { CV, CVBlocks, ObjectId } from '$lib/types/cv';
import { preprocessBlocks } from './preprocess';
import { computeBlockHashes } from '$lib/features/tailoring/hash';

function id(): ObjectId {
	return createObjectId();
}

function makeCV(overrides: Partial<CV> = {}): CV {
	const fullNameId = id();
	const positionId = id();
	const locationId = id();
	const contactsId = id();
	const highlightsId = id();
	const skillsId = id();
	const jobHistoryId = id();
	const projectsId = id();
	const educationId = id();

	const blocks: CVBlocks = {
		fullName: { objectId: fullNameId, value: 'Jane Doe' },
		position: { objectId: positionId, value: 'Software Engineer' },
		location: { objectId: locationId, value: 'London, UK' },
		contacts: {
			objectId: contactsId,
			value: [{ objectId: id(), label: 'Email', value: 'jane@example.com' }]
		},
		highlights: { objectId: highlightsId, value: [{ objectId: id(), text: 'Built things.' }] },
		skills: {
			objectId: skillsId,
			value: [{ objectId: id(), name: 'Frontend', skills: [{ objectId: id(), value: 'React' }] }]
		},
		jobHistory: {
			objectId: jobHistoryId,
			value: [
				{
					objectId: id(),
					company: 'Acme',
					role: 'Engineer',
					startDate: new Date('2020-01-01'),
					endDate: undefined,
					current: true,
					achievements: [{ objectId: id(), text: 'Did stuff.' }],
					skills: []
				}
			]
		},
		projects: {
			objectId: projectsId,
			value: [{ objectId: id(), name: 'MyApp', description: 'A cool app.', stack: [], link: '' }]
		},
		education: {
			objectId: educationId,
			value: [
				{
					objectId: id(),
					institution: 'Uni',
					degree: 'BSc',
					startDate: new Date('2015-01-01'),
					endDate: new Date('2019-01-01'),
					current: false
				}
			]
		}
	};

	return {
		id: 'test-cv',
		name: 'Test CV',
		createdAt: Date.now(),
		updatedAt: Date.now(),
		hiddenBlockIds: [],
		blocks,
		blockHashes: computeBlockHashes(blocks),
		...overrides
	};
}

describe('preprocessBlocks', () => {
	it('keeps all visible non-empty blocks', () => {
		const cv = makeCV();
		const result = preprocessBlocks(cv);
		expect(result.fullName?.value).toBe('Jane Doe');
		expect(result.position?.value).toBe('Software Engineer');
		expect(result.location?.value).toBe('London, UK');
		expect(result.contacts?.value).toHaveLength(1);
		expect(result.highlights?.value).toHaveLength(1);
		expect(result.skills?.value).toHaveLength(1);
		expect(result.jobHistory?.value).toHaveLength(1);
		expect(result.projects?.value).toHaveLength(1);
		expect(result.education?.value).toHaveLength(1);
	});

	it('drops text blocks that are hidden', () => {
		const cv = makeCV();
		cv.hiddenBlockIds = [cv.blocks.fullName.objectId, cv.blocks.location.objectId];
		const result = preprocessBlocks(cv);
		expect(result.fullName).toBeUndefined();
		expect(result.location).toBeUndefined();
		expect(result.position?.value).toBe('Software Engineer');
	});

	it('drops list blocks that are hidden', () => {
		const cv = makeCV();
		cv.hiddenBlockIds = [cv.blocks.jobHistory.objectId, cv.blocks.skills.objectId];
		const result = preprocessBlocks(cv);
		expect(result.jobHistory).toBeUndefined();
		expect(result.skills).toBeUndefined();
	});

	it('drops empty text blocks even if visible', () => {
		const cv = makeCV();
		cv.blocks.position = { ...cv.blocks.position, value: '   ' };
		const result = preprocessBlocks(cv);
		expect(result.position).toBeUndefined();
	});

	it('drops highlights block if all entries have empty text', () => {
		const cv = makeCV();
		cv.blocks.highlights.value = [
			{ objectId: id(), text: '' },
			{ objectId: id(), text: '  ' }
		];
		const result = preprocessBlocks(cv);
		expect(result.highlights).toBeUndefined();
	});

	it('drops skills block if all categories have no skills', () => {
		const cv = makeCV();
		cv.blocks.skills.value = [{ objectId: id(), name: 'Empty', skills: [] }];
		const result = preprocessBlocks(cv);
		expect(result.skills).toBeUndefined();
	});

	it('drops contacts block if all entries are empty', () => {
		const cv = makeCV();
		cv.blocks.contacts.value = [{ objectId: id(), label: '', value: '' }];
		const result = preprocessBlocks(cv);
		expect(result.contacts).toBeUndefined();
	});

	it('filters out empty contact entries but keeps non-empty ones', () => {
		const cv = makeCV();
		cv.blocks.contacts.value = [
			{ objectId: id(), label: 'Email', value: 'jane@example.com' },
			{ objectId: id(), label: '', value: '' }
		];
		const result = preprocessBlocks(cv);
		expect(result.contacts?.value).toHaveLength(1);
	});

	it('drops job history block if entry array is empty', () => {
		const cv = makeCV();
		cv.blocks.jobHistory.value = [];
		const result = preprocessBlocks(cv);
		expect(result.jobHistory).toBeUndefined();
	});

	it('drops projects block if entry array is empty', () => {
		const cv = makeCV();
		cv.blocks.projects.value = [];
		const result = preprocessBlocks(cv);
		expect(result.projects).toBeUndefined();
	});

	it('drops education block if entry array is empty', () => {
		const cv = makeCV();
		cv.blocks.education.value = [];
		const result = preprocessBlocks(cv);
		expect(result.education).toBeUndefined();
	});

	it('returns an empty object for a completely hidden/empty CV', () => {
		const cv = makeCV();
		cv.hiddenBlockIds = Object.values(cv.blocks).map((b) => b.objectId);
		const result = preprocessBlocks(cv);
		expect(Object.keys(result)).toHaveLength(0);
	});
});
