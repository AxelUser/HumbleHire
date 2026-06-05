// External-interop guard. Validates that HumbleHire's export output passes the @jsonresume/schema
// validator (the upstream JSON Resume validator, independent of our inlined schema snapshot) and
// that our schema accepts a canonical JSON Resume document on import.
//
// These are not unit tests — they are interop boundary checks. A failure here means either:
//   (a) our export broke JSON Resume compatibility, or
//   (b) JSON Resume released a new schema that our inlined base needs to be re-synced with
//       (consider bumping to v0.0.2 when that happens).
//
// The @jsonresume/schema validate function is callback-based; we wrap it in a Promise.
import { describe, expect, it } from 'vitest';
import { validate as validateJsonResume } from '@jsonresume/schema';
import { toDocument, toJsonResume } from './serialize';
import { parseDocument } from './parse';
import { makeCompleteCV } from './__fixtures__/complete-cv';

function assertValidJsonResume(doc: unknown): Promise<void> {
	return new Promise((resolve, reject) => {
		validateJsonResume(doc, (errors: unknown, valid: boolean) => {
			if (valid) resolve();
			else reject(new Error(`JSON Resume validation failed: ${JSON.stringify(errors, null, 2)}`));
		});
	});
}

// A canonical JSON Resume document taken from the @jsonresume/schema sample fixture:
// https://github.com/jsonresume/resume-schema/blob/48869d84d7c07d80ea1b35c3b94299cdd2792097/sample.resume.json
// Used to verify that our schema accepts documents produced by other tools.
const CANONICAL_JSON_RESUME = {
	$schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
	basics: {
		name: 'Richard Hendriks',
		label: 'Programmer',
		image: '',
		email: 'richard.hendriks@mail.com',
		phone: '(912) 555-4321',
		url: 'http://richardhendricks.example.com',
		summary:
			'Richard hails from Tulsa. He has earned degrees from the University of Oklahoma and Stanford. (Go Sooners and Cardinal!) Before starting Pied Piper, he worked for Hooli as a part time software developer. While his work focuses on applied information theory, mostly optimizing lossless compression schema of both the length-limited and adaptive variants, his non-work interests range widely, everything from quantum computing to chaos theory. He could tell you about it, but THAT would NOT be a “length-limited” conversation!',
		location: {
			address: '2712 Broadway St',
			postalCode: 'CA 94115',
			city: 'San Francisco',
			countryCode: 'US',
			region: 'California'
		},
		profiles: [
			{
				network: 'Twitter',
				username: 'neutralthoughts',
				url: 'https://www.twitter.com'
			},
			{
				network: 'SoundCloud',
				username: 'dandymusicnl',
				url: 'https://soundcloud.example.com/dandymusicnl'
			}
		]
	},
	work: [
		{
			name: 'Pied Piper',
			location: 'Palo Alto, CA',
			description: 'Awesome compression company',
			position: 'CEO/President',
			url: 'http://piedpiper.example.com',
			startDate: '2013-12-01',
			endDate: '2014-12-01',
			summary:
				'Pied Piper is a multi-platform technology based on a proprietary universal compression algorithm that has consistently fielded high Weisman Scores™ that are not merely competitive, but approach the theoretical limit of lossless compression.',
			highlights: [
				'Build an algorithm for artist to detect if their music was violating copy right infringement laws',
				'Successfully won Techcrunch Disrupt',
				'Optimized an algorithm that holds the current world record for Weisman Scores'
			]
		}
	],
	volunteer: [
		{
			organization: 'CoderDojo',
			position: 'Teacher',
			url: 'http://coderdojo.example.com/',
			startDate: '2012-01-01',
			endDate: '2013-01-01',
			summary: 'Global movement of free coding clubs for young people.',
			highlights: ["Awarded 'Teacher of the Month'"]
		}
	],
	education: [
		{
			institution: 'University of Oklahoma',
			url: 'https://www.ou.edu/',
			area: 'Information Technology',
			studyType: 'Bachelor',
			startDate: '2011-06-01',
			endDate: '2014-01-01',
			score: '4.0',
			courses: ['DB1101 - Basic SQL', 'CS2011 - Java Introduction']
		}
	],
	awards: [
		{
			title: 'Digital Compression Pioneer Award',
			date: '2014-11-01',
			awarder: 'Techcrunch',
			summary: 'There is no spoon.'
		}
	],
	publications: [
		{
			name: 'Video compression for 3d media',
			publisher: 'Hooli',
			releaseDate: '2014-10-01',
			url: 'http://en.wikipedia.org/wiki/Silicon_Valley_(TV_series)',
			summary: 'Innovative middle-out compression algorithm that changes the way we store data.'
		}
	],
	skills: [
		{
			name: 'Web Development',
			level: 'Master',
			keywords: ['HTML', 'CSS', 'Javascript']
		},
		{
			name: 'Compression',
			level: 'Master',
			keywords: ['Mpeg', 'MP4', 'GIF']
		}
	],
	languages: [
		{
			language: 'English',
			fluency: 'Native speaker'
		}
	],
	interests: [
		{
			name: 'Wildlife',
			keywords: ['Ferrets', 'Unicorns']
		}
	],
	references: [
		{
			name: 'Erlich Bachman',
			reference:
				'It is my pleasure to recommend Richard, his performance working as a consultant for Main St. Company proved that he will be a valuable addition to any company.'
		}
	],
	projects: [
		{
			name: 'Miss Direction',
			description: 'A mapping engine that misguides you',
			highlights: [
				'Won award at AIHacks 2016',
				'Built by all women team of newbie programmers',
				'Using modern technologies such as GoogleMaps, Chrome Extension and Javascript'
			],
			keywords: ['GoogleMaps', 'Chrome Extension', 'Javascript'],
			startDate: '2016-08-24',
			endDate: '2016-08-24',
			url: 'http://missdirection.example.com',
			roles: ['Team lead', 'Designer'],
			entity: 'Smoogle',
			type: 'application'
		}
	],
	meta: {
		canonical:
			'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/sample.resume.json',
		version: 'v1.0.0',
		lastModified: '2017-12-24T15:53:00'
	}
};

describe('JSON Resume export compatibility', () => {
	it('toJsonResume output passes @jsonresume/schema validation', async () => {
		const doc = toJsonResume(makeCompleteCV());
		await expect(assertValidJsonResume(doc)).resolves.toBeUndefined();
	});

	it('toDocument (HumbleHire JSON) output passes @jsonresume/schema validation', async () => {
		const doc = toDocument(makeCompleteCV());
		await expect(assertValidJsonResume(doc)).resolves.toBeUndefined();
	});
});

describe('JSON Resume import compatibility', () => {
	it('parseDocument accepts a canonical JSON Resume document', () => {
		const result = parseDocument(JSON.stringify(CANONICAL_JSON_RESUME));
		expect(result.ok).toBe(true);
	});

	it('parseDocument maps a canonical JSON Resume document to a usable CV', () => {
		const result = parseDocument(JSON.stringify(CANONICAL_JSON_RESUME));
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.doc.basics?.name).toBe('Richard Hendriks');
			expect(result.doc.work?.[0].name).toBe('Pied Piper');
			expect(result.doc.education?.[0].institution).toBe('University of Oklahoma');
		}
	});
});
