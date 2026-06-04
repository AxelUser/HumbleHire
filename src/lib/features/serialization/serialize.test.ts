import { describe, expect, it } from 'vitest';
import { toDocument, toJsonResume, fromDocument, unmappedSections } from './serialize';
import type { CV } from '$lib/types/cv';
import { makeCompleteCV } from './__fixtures__/complete-cv';

function makeCV(overrides: Partial<CV> = {}): CV {
	return makeCompleteCV(overrides);
}

describe('toDocument', () => {
	it('maps fullName → basics.name', () => {
		expect(toDocument(makeCV()).basics?.name).toBe('Jane Doe');
	});

	it('maps position → basics.label', () => {
		expect(toDocument(makeCV()).basics?.label).toBe('Senior Engineer');
	});

	it('maps highlights → basics.highlights', () => {
		expect(toDocument(makeCV()).basics?.highlights).toEqual([
			'10 years building distributed systems',
			'Led a platform team of 6'
		]);
	});

	it('does not include summary in HumbleHire JSON', () => {
		expect(toDocument(makeCV()).basics?.summary).toBeUndefined();
	});

	it('maps location → basics.location.address', () => {
		expect(toDocument(makeCV()).basics?.location?.address).toBe('Berlin, DE');
	});

	it('maps contacts to standard fields and stashes exact copy in meta', () => {
		const doc = toDocument(makeCV());
		expect(doc.basics?.email).toBe('jane@example.com');
		expect(doc.meta?.humblehire?.contacts).toEqual([
			{ label: 'Email', value: 'jane@example.com' },
			{ label: 'GitHub', value: 'https://github.com/jane' }
		]);
	});

	it('maps jobHistory → work with current encoded as absent endDate', () => {
		const work = toDocument(makeCV()).work;
		expect(work).toHaveLength(1);
		expect(work![0].name).toBe('Acme');
		expect(work![0].position).toBe('Senior Engineer');
		expect(work![0].startDate).toBe('2020-01');
		expect(work![0].endDate).toBeUndefined();
		expect(work![0].highlights).toEqual(['Cut p99 latency by 40%']);
		expect(work![0].keywords).toEqual(['Go', 'Kubernetes']);
	});

	it('maps education → studyType and encodes dates', () => {
		const edu = toDocument(makeCV()).education;
		expect(edu![0].studyType).toBe('BSc Computer Science');
		expect(edu![0].startDate).toBe('2014-09');
		expect(edu![0].endDate).toBe('2018-06');
	});

	it('maps skills[].skills → skills[].keywords', () => {
		expect(toDocument(makeCV()).skills![0].keywords).toEqual(['Go', 'TypeScript']);
	});

	it('maps projects[].stack → keywords and link → url', () => {
		const proj = toDocument(makeCV()).projects![0];
		expect(proj.keywords).toEqual(['Rust', 'Postgres']);
		expect(proj.url).toBe('https://example.com');
	});

	it('omits empty blocks entirely', () => {
		const cv = makeCV();
		cv.blocks.projects.value = [];
		const doc = toDocument(cv);
		expect(doc.projects).toBeUndefined();
	});

	it('sets $schema to the HumbleHire schema URL', () => {
		expect(toDocument(makeCV()).$schema).toContain('humblehire.app');
	});
});

describe('toJsonResume', () => {
	it('joins highlights into summary', () => {
		const doc = toJsonResume(makeCV());
		expect(doc.basics?.summary).toBe(
			'10 years building distributed systems\nLed a platform team of 6'
		);
	});

	it('omits basics.highlights', () => {
		expect(toJsonResume(makeCV()).basics?.highlights).toBeUndefined();
	});

	it('omits work[].keywords', () => {
		expect(toJsonResume(makeCV()).work![0].keywords).toBeUndefined();
	});

	it('omits meta.humblehire', () => {
		expect(toJsonResume(makeCV()).meta).toBeUndefined();
	});

	it('sets $schema to the JSON Resume schema URL', () => {
		expect(toJsonResume(makeCV()).$schema).toContain('jsonresume');
	});
});

describe('fromDocument round-trip (via toDocument)', () => {
	function roundTrip(cv: CV): CV {
		return fromDocument(toDocument(cv));
	}

	it('preserves fullName', () => {
		expect(roundTrip(makeCV()).blocks.fullName.value).toBe('Jane Doe');
	});

	it('preserves position', () => {
		expect(roundTrip(makeCV()).blocks.position.value).toBe('Senior Engineer');
	});

	it('preserves location', () => {
		expect(roundTrip(makeCV()).blocks.location.value).toBe('Berlin, DE');
	});

	it('preserves highlights text', () => {
		const texts = roundTrip(makeCV()).blocks.highlights.value.map((h) => h.text);
		expect(texts).toEqual(['10 years building distributed systems', 'Led a platform team of 6']);
	});

	it('preserves contacts exactly via meta stash', () => {
		const contacts = roundTrip(makeCV()).blocks.contacts.value;
		expect(contacts.map((c) => ({ label: c.label, value: c.value }))).toEqual([
			{ label: 'Email', value: 'jane@example.com' },
			{ label: 'GitHub', value: 'https://github.com/jane' }
		]);
	});

	it('preserves job company, role, current, achievements, and keywords', () => {
		const job = roundTrip(makeCV()).blocks.jobHistory.value[0];
		expect(job.company).toBe('Acme');
		expect(job.role).toBe('Senior Engineer');
		expect(job.current).toBe(true);
		expect(job.endDate).toBeUndefined();
		expect(job.achievements.map((a) => a.text)).toEqual(['Cut p99 latency by 40%']);
		expect(job.skills.map((s) => s.value)).toEqual(['Go', 'Kubernetes']);
	});

	it('preserves education degree and dates', () => {
		const edu = roundTrip(makeCV()).blocks.education.value[0];
		expect(edu.institution).toBe('TU Berlin');
		expect(edu.degree).toBe('BSc Computer Science');
		expect(edu.current).toBe(false);
	});

	it('preserves project stack and link', () => {
		const proj = roundTrip(makeCV()).blocks.projects.value[0];
		expect(proj.stack.map((t) => t.value)).toEqual(['Rust', 'Postgres']);
		expect(proj.link).toBe('https://example.com');
	});

	it('produces a new CV name from basics.name', () => {
		expect(roundTrip(makeCV()).name).toBe('Jane Doe');
	});
});

describe('fromDocument — foreign JSON Resume paths (@temporal-coercion coverage)', () => {
	it('defaults name to "Imported CV" when basics.name is absent', () => {
		expect(fromDocument({}).name).toBe('Imported CV');
	});

	it('falls back to summary-split when highlights are absent', () => {
		const doc = { basics: { summary: 'Line one\nLine two' } };
		const cv = fromDocument(doc);
		expect(cv.blocks.highlights.value.map((h) => h.text)).toEqual(['Line one', 'Line two']);
	});

	it('reconstructs contacts from standard fields when meta stash is absent', () => {
		const doc = {
			basics: {
				email: 'bob@example.com',
				profiles: [{ network: 'GitHub', url: 'github.com/bob' }]
			}
		};
		const contacts = fromDocument(doc).blocks.contacts.value;
		expect(contacts.map((c) => ({ label: c.label, value: c.value }))).toEqual([
			{ label: 'Email', value: 'bob@example.com' },
			{ label: 'GitHub', value: 'github.com/bob' }
		]);
	});

	it('joins location object fields when address is absent (foreign file)', () => {
		const doc = { basics: { location: { city: 'Berlin', countryCode: 'DE' } } };
		expect(fromDocument(doc).blocks.location.value).toBe('Berlin, DE');
	});

	it('reads studyType falling back to area for foreign files', () => {
		const doc = { education: [{ area: 'Computer Science' }] };
		expect(fromDocument(doc).blocks.education.value[0].degree).toBe('Computer Science');
	});

	it('joins studyType and area when both are present (foreign file)', () => {
		const doc = { education: [{ studyType: 'BSc', area: 'Computer Science' }] };
		expect(fromDocument(doc).blocks.education.value[0].degree).toBe('BSc Computer Science');
	});

	it('maps foreign work using JSON Resume field names (name, position, highlights)', () => {
		const doc = {
			work: [
				{
					name: 'ACME Corp',
					position: 'Dev',
					startDate: '2019-03',
					highlights: ['Built the thing']
				}
			]
		};
		const job = fromDocument(doc).blocks.jobHistory.value[0];
		expect(job.company).toBe('ACME Corp');
		expect(job.role).toBe('Dev');
		expect(job.achievements[0].text).toBe('Built the thing');
	});

	it('treats absent endDate on a work item as current=true', () => {
		const doc = { work: [{ startDate: '2020-01' }] };
		expect(fromDocument(doc).blocks.jobHistory.value[0].current).toBe(true);
	});

	it('treats present endDate on a work item as current=false', () => {
		const doc = { work: [{ startDate: '2019-01', endDate: '2021-06' }] };
		expect(fromDocument(doc).blocks.jobHistory.value[0].current).toBe(false);
	});
});

describe('unmappedSections', () => {
	it('returns empty array for a document with only mapped sections', () => {
		expect(
			unmappedSections({ basics: { name: 'A' }, work: [], education: [], skills: [], projects: [] })
		).toEqual([]);
	});

	it('reports foreign sections by name', () => {
		const doc = { basics: {}, awards: [], languages: [], volunteer: [] } as Record<string, unknown>;
		const dropped = unmappedSections(doc as Parameters<typeof unmappedSections>[0]);
		expect(dropped.sort()).toEqual(['awards', 'languages', 'volunteer']);
	});

	it('does not flag $schema or meta as unmapped', () => {
		const doc = {
			$schema: 'https://jsonresume.org/schema',
			basics: {},
			meta: { humblehire: { schemaVersion: '0.0.1' } }
		};
		expect(unmappedSections(doc)).toEqual([]);
	});
});
