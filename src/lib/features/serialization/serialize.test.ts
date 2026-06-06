import { describe, expect, it } from 'vitest';
import { APP_BASE_URL } from '$lib/config';
import { fromDocument, toDocument, toJsonResume, unmappedSections } from './serialize';
import { makeCompleteCV } from './__fixtures__/complete-cv';

describe('toDocument (HumbleHire JSON)', () => {
	const doc = toDocument(makeCompleteCV());

	it('maps basics to standard JSON Resume fields', () => {
		expect(doc.basics?.name).toBe('Jane Doe');
		expect(doc.basics?.label).toBe('Senior Engineer');
		expect(doc.basics?.image).toBe('https://example.com/jane.png');
		expect(doc.basics?.email).toBe('jane@example.com');
		expect(doc.basics?.location?.address).toBe('Berlin, DE');
	});

	it('keeps highlights and summary first-class', () => {
		expect(doc.basics?.highlights).toEqual([
			'10 years building distributed systems',
			'Led a platform team of 6'
		]);
		expect(doc.basics?.summary).toBe('Distributed systems engineer.');
	});

	it('maps typed profiles instead of a contacts stash', () => {
		expect(doc.basics?.profiles).toEqual([
			{ network: 'GitHub', username: 'jane', url: 'https://github.com/jane' }
		]);
		expect(doc.meta?.humblehire).not.toHaveProperty('contacts');
	});

	it('encodes a current job as an absent endDate plus a current flag', () => {
		const work = doc.work![0];
		expect(work.name).toBe('Acme');
		expect(work.startDate).toBe('2020-01');
		expect(work.endDate).toBeUndefined();
		expect((work as { current?: boolean }).current).toBe(true);
		expect(work.highlights).toEqual(['Cut p99 latency by 40%']);
		expect(work.keywords).toEqual(['Go', 'Kubernetes']);
	});

	it('splits education into studyType and area with its own lists', () => {
		const edu = doc.education![0];
		expect(edu.studyType).toBe('BSc');
		expect(edu.area).toBe('Computer Science');
		expect(edu.courses).toEqual(['Distributed Systems']);
	});

	it('maps projects roles, entity, and type', () => {
		const proj = doc.projects![0];
		expect(proj.roles).toEqual(['Tech Lead']);
		expect(proj.entity).toBe('Acme');
		expect(proj.type).toBe('application');
	});

	it('carries every previously-editorless section through', () => {
		expect(doc.volunteer![0].organization).toBe('Code Club');
		expect(doc.awards![0].title).toBe('Best Paper');
		expect(doc.certificates![0].name).toBe('CKA');
		expect(doc.publications![0].releaseDate).toBe('2022-01');
		expect(doc.languages![0].language).toBe('German');
		expect(doc.interests![0].keywords).toEqual(['Bouldering']);
		expect(doc.references![0].reference).toBe('Great engineer.');
	});

	it('omits empty sections', () => {
		const cv = makeCompleteCV();
		cv.content.projects = [];
		expect(toDocument(cv).projects).toBeUndefined();
	});

	it('stamps the v0.1.0 schema url and version', () => {
		expect(doc.$schema).toBe(`${APP_BASE_URL}/schema/resume/v0.1.0.json`);
		expect(doc.meta?.humblehire?.schemaVersion).toBe('0.1.0');
	});
});

describe('toJsonResume (plain projection)', () => {
	const doc = toJsonResume(makeCompleteCV());

	it('folds the summary and highlights into the standard summary string', () => {
		expect(doc.basics?.summary).toBe(
			'Distributed systems engineer.\n10 years building distributed systems\nLed a platform team of 6'
		);
		expect(doc.basics?.highlights).toBeUndefined();
	});

	it('drops work keywords', () => {
		expect(doc.work![0].keywords).toBeUndefined();
	});

	it('stashes the originals in meta for exact recovery', () => {
		expect(doc.meta?.humblehire?.highlights).toEqual([
			'10 years building distributed systems',
			'Led a platform team of 6'
		]);
		expect(doc.meta?.humblehire?.summary).toBe('Distributed systems engineer.');
	});

	it('points $schema at JSON Resume', () => {
		expect(doc.$schema).toContain('jsonresume');
	});
});

describe('round-trip', () => {
	it('is a faithful inverse at the wire level for a complete CV', () => {
		const doc = toDocument(makeCompleteCV());
		expect(toDocument(fromDocument(doc))).toEqual(doc);
	});

	it('recovers exact highlights and summary from a re-imported plain export', () => {
		const cv = fromDocument(toJsonResume(makeCompleteCV()));
		expect(cv.content.basics.highlights.map((h) => h.value)).toEqual([
			'10 years building distributed systems',
			'Led a platform team of 6'
		]);
		expect(cv.content.basics.summary).toBe('Distributed systems engineer.');
	});
});

describe('fromDocument (foreign JSON Resume)', () => {
	it('defaults the name when basics.name is absent', () => {
		expect(fromDocument({}).name).toBe('Imported CV');
	});

	it('splits a foreign summary into highlights and empties the summary field', () => {
		const cv = fromDocument({ basics: { summary: 'Line one\nLine two' } });
		expect(cv.content.basics.highlights.map((h) => h.value)).toEqual(['Line one', 'Line two']);
		expect(cv.content.basics.summary).toBe('');
	});

	it('joins a location object when address is absent', () => {
		const cv = fromDocument({ basics: { location: { city: 'Berlin', countryCode: 'DE' } } });
		expect(cv.content.basics.location).toBe('Berlin, DE');
	});

	it('keeps studyType and area separate', () => {
		const cv = fromDocument({ education: [{ studyType: 'BSc', area: 'CS' }] });
		expect(cv.content.education[0].studyType).toBe('BSc');
		expect(cv.content.education[0].area).toBe('CS');
	});

	it('treats an absent work endDate as current', () => {
		expect(fromDocument({ work: [{ startDate: '2020-01' }] }).content.work[0].current).toBe(true);
	});

	it('imports foreign sections instead of dropping them', () => {
		const cv = fromDocument({
			volunteer: [{ organization: 'Red Cross', position: 'Helper' }],
			awards: [{ title: 'MVP' }],
			languages: [{ language: 'French', fluency: 'Fluent' }]
		});
		expect(cv.content.volunteer[0].organization).toBe('Red Cross');
		expect(cv.content.awards[0].title).toBe('MVP');
		expect(cv.content.languages[0].language).toBe('French');
	});
});

describe('unmappedSections', () => {
	it('is empty when every key is a known section', () => {
		expect(unmappedSections({ basics: {}, work: [], awards: [], languages: [] })).toEqual([]);
	});

	it('reports only keys outside the JSON Resume schema', () => {
		const doc = { basics: {}, somethingCustom: [] } as Parameters<typeof unmappedSections>[0];
		expect(unmappedSections(doc)).toEqual(['somethingCustom']);
	});

	it('ignores $schema and meta', () => {
		const doc = {
			$schema: 'https://jsonresume.org/schema',
			meta: { humblehire: { schemaVersion: '0.1.0' } }
		};
		expect(unmappedSections(doc)).toEqual([]);
	});
});
