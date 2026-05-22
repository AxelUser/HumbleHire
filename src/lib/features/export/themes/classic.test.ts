import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { CVBlocks, ObjectId } from '$lib/types/cv';
import { classicTheme } from './classic';

function id(): ObjectId {
	return createObjectId();
}

function makeBlocks(overrides: Partial<CVBlocks> = {}): Partial<CVBlocks> {
	return {
		fullName: { objectId: id(), value: 'Jane Doe' },
		position: { objectId: id(), value: 'Software Engineer' },
		location: { objectId: id(), value: 'London, UK' },
		contacts: {
			objectId: id(),
			value: [{ objectId: id(), label: 'Email', value: 'jane@example.com' }]
		},
		...overrides
	};
}

describe('classicTheme.build', () => {
	it('returns A4 page size with correct margins', () => {
		const doc = classicTheme.build(makeBlocks());
		expect(doc.pageSize).toBe('A4');
		expect(doc.pageMargins).toEqual([42.5, 56.7, 42.5, 56.7]);
	});

	it('uses Roboto as the default font', () => {
		const doc = classicTheme.build(makeBlocks());
		expect(doc.defaultStyle.font).toBe('Roboto');
	});

	it('produces non-empty content for a full CV', () => {
		const blocks = makeBlocks({
			highlights: {
				objectId: id(),
				value: [{ objectId: id(), text: 'Led a team.' }]
			},
			skills: {
				objectId: id(),
				value: [{ objectId: id(), name: 'Frontend', skills: [{ objectId: id(), value: 'React' }] }]
			},
			jobHistory: {
				objectId: id(),
				value: [{
					objectId: id(), company: 'Acme', role: 'Engineer',
					startDate: new Date('2020-01-01'), endDate: undefined,
					achievements: [{ objectId: id(), text: 'Shipped features.' }],
					skills: []
				}]
			},
			projects: {
				objectId: id(),
				value: [{
					objectId: id(), name: 'MyApp', description: 'Cool app.',
					stack: [{ objectId: id(), value: 'Svelte' }],
					link: 'https://github.com/user/myapp'
				}]
			},
			education: {
				objectId: id(),
				value: [{
					objectId: id(), institution: 'University', degree: 'BSc',
					startDate: new Date('2015-01-01'), endDate: new Date('2019-01-01')
				}]
			}
		});
		const doc = classicTheme.build(blocks);
		expect(Array.isArray(doc.content)).toBe(true);
		expect(doc.content.length).toBeGreaterThan(0);
	});

	it('produces empty content array for empty blocks', () => {
		const doc = classicTheme.build({});
		expect(doc.content).toEqual([]);
	});

	it('includes section headings for present sections', () => {
		const blocks = makeBlocks({
			jobHistory: {
				objectId: id(),
				value: [{
					objectId: id(), company: 'Acme', role: 'Dev',
					startDate: undefined, endDate: undefined,
					achievements: [], skills: []
				}]
			}
		});
		const doc = classicTheme.build(blocks);
		const contentStr = JSON.stringify(doc.content);
		expect(contentStr).toContain('EXPERIENCE');
	});

	it('formats skill category correctly', () => {
		const blocks: Partial<CVBlocks> = {
			skills: {
				objectId: id(),
				value: [
					{ objectId: id(), name: 'Backend', skills: [{ objectId: id(), value: 'Go' }, { objectId: id(), value: 'Postgres' }] },
					{ objectId: id(), name: '', skills: [{ objectId: id(), value: 'Docker' }] }
				]
			}
		};
		const doc = classicTheme.build(blocks);
		const contentStr = JSON.stringify(doc.content);
		expect(contentStr).toContain('Backend: Go, Postgres');
		expect(contentStr).toContain('Docker');
		expect(contentStr).not.toContain(': Docker');
	});

	it('uses Present for a job with no end date', () => {
		const blocks: Partial<CVBlocks> = {
			jobHistory: {
				objectId: id(),
				value: [{
					objectId: id(), company: 'Startup', role: 'Lead',
					startDate: new Date('2022-06-01'), endDate: undefined,
					achievements: [], skills: []
				}]
			}
		};
		const doc = classicTheme.build(blocks);
		expect(JSON.stringify(doc.content)).toContain('Present');
	});

	it('trims project link URLs', () => {
		const blocks: Partial<CVBlocks> = {
			projects: {
				objectId: id(),
				value: [{
					objectId: id(), name: 'Repo', description: '',
					stack: [], link: 'https://github.com/user/repo'
				}]
			}
		};
		const doc = classicTheme.build(blocks);
		expect(JSON.stringify(doc.content)).toContain('github.com/user/repo');
	});

	it('applies pageBreak: avoid to first job entry container', () => {
		const blocks: Partial<CVBlocks> = {
			jobHistory: {
				objectId: id(),
				value: [{
					objectId: id(), company: 'Co', role: 'Dev',
					startDate: undefined, endDate: undefined,
					achievements: [], skills: []
				}]
			}
		};
		const doc = classicTheme.build(blocks);
		const hasAvoid = doc.content.some(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(item: any) => item.pageBreak === 'avoid'
		);
		expect(hasAvoid).toBe(true);
	});
});
