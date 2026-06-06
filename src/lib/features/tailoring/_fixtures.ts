import {
	createObjectId,
	type Basics,
	type CV,
	type CVContent,
	type EducationEntry,
	type ObjectId,
	type ProjectEntry,
	type SkillCategory,
	type StringEntry,
	type WorkEntry
} from '$lib/types/cv';
import { computeHashes } from './hash';

export function id(): ObjectId {
	return createObjectId();
}

export function str(value: string): StringEntry {
	return { objectId: id(), value };
}

export function emptyBasics(over: Partial<Basics> = {}): Basics {
	return {
		fullName: 'John Doe',
		position: 'Engineer',
		location: 'NYC',
		summary: '',
		highlights: [],
		email: '',
		phone: '',
		url: '',
		profiles: [],
		...over
	};
}

export function makeWork(name: string, position: string, over: Partial<WorkEntry> = {}): WorkEntry {
	return {
		objectId: id(),
		name,
		position,
		current: false,
		summary: '',
		highlights: [],
		keywords: [],
		...over
	};
}

export function makeEducation(
	institution: string,
	over: Partial<EducationEntry> = {}
): EducationEntry {
	return {
		objectId: id(),
		institution,
		studyType: '',
		area: '',
		current: false,
		courses: [],
		...over
	};
}

export function makeSkill(name: string, keywords: string[] = []): SkillCategory {
	return { objectId: id(), name, keywords: keywords.map(str) };
}

export function makeProject(name: string, over: Partial<ProjectEntry> = {}): ProjectEntry {
	return {
		objectId: id(),
		name,
		description: '',
		url: '',
		current: false,
		highlights: [],
		keywords: [],
		roles: [],
		...over
	};
}

export function emptyContent(over: Partial<CVContent> = {}): CVContent {
	return {
		basics: emptyBasics(),
		work: [],
		volunteer: [],
		education: [],
		awards: [],
		certificates: [],
		publications: [],
		skills: [],
		languages: [],
		interests: [],
		references: [],
		projects: [],
		...over
	};
}

export function makeMaster(content?: Partial<CVContent>, cvOverrides?: Partial<CV>): CV {
	const full = emptyContent(content);
	return {
		id: 'master-1',
		name: 'Master CV',
		createdAt: 1000,
		updatedAt: 1000,
		content: full,
		hashes: computeHashes(full),
		hidden: [],
		...cvOverrides
	};
}

export function makeTailored(master: CV, overrides?: Partial<CV>): CV {
	const content = structuredClone(master.content);
	return {
		id: 'tailored-1',
		name: 'Tailored CV',
		createdAt: 2000,
		updatedAt: 2000,
		content,
		hashes: { ...master.hashes },
		hidden: [...master.hidden],
		sourceId: master.id,
		baseline: structuredClone(master.content),
		baselineHashes: { ...master.hashes },
		...overrides
	};
}

/** Every section populated and every field set — the coverage and round-trip fixture. */
export function completeContent(): CVContent {
	return {
		basics: {
			fullName: 'Jane Doe',
			position: 'Senior Engineer',
			image: 'https://example.com/jane.png',
			location: 'Berlin, DE',
			summary: 'Distributed systems engineer.',
			highlights: [str('10 years building distributed systems'), str('Led a platform team of 6')],
			email: 'jane@example.com',
			phone: '+49 30 123456',
			url: 'https://jane.example.com',
			profiles: [
				{ objectId: id(), network: 'GitHub', username: 'jane', url: 'https://github.com/jane' }
			]
		},
		work: [
			{
				objectId: id(),
				name: 'Acme',
				position: 'Senior Engineer',
				location: 'Berlin',
				description: 'Logistics Company',
				url: 'https://acme.example.com',
				startDate: new Date(2020, 0, 1),
				endDate: undefined,
				current: true,
				summary: 'Owned the routing platform.',
				highlights: [str('Cut p99 latency by 40%')],
				keywords: [str('Go'), str('Kubernetes')]
			}
		],
		volunteer: [
			{
				objectId: id(),
				organization: 'Code Club',
				position: 'Mentor',
				url: 'https://codeclub.example.com',
				startDate: new Date(2019, 5, 1),
				endDate: new Date(2021, 5, 1),
				current: false,
				summary: 'Taught teenagers to code.',
				highlights: [str('Ran weekly sessions')]
			}
		],
		education: [
			{
				objectId: id(),
				institution: 'TU Berlin',
				url: 'https://tu.berlin',
				studyType: 'BSc',
				area: 'Computer Science',
				startDate: new Date(2014, 8, 1),
				endDate: new Date(2018, 5, 1),
				current: false,
				score: '1.3',
				courses: [str('Distributed Systems')]
			}
		],
		awards: [
			{
				objectId: id(),
				title: 'Best Paper',
				date: new Date(2022, 2, 1),
				awarder: 'ACM',
				summary: 'For work on consensus.'
			}
		],
		certificates: [
			{
				objectId: id(),
				name: 'CKA',
				date: new Date(2021, 9, 1),
				url: 'https://cncf.io',
				issuer: 'CNCF'
			}
		],
		publications: [
			{
				objectId: id(),
				name: 'On Consensus',
				publisher: 'IEEE',
				releaseDate: new Date(2022, 0, 1),
				url: 'https://ieee.example.com',
				summary: 'A survey of consensus protocols.'
			}
		],
		skills: [
			{
				objectId: id(),
				name: 'Languages',
				level: 'Expert',
				keywords: [str('Go'), str('TypeScript')]
			}
		],
		languages: [{ objectId: id(), language: 'German', fluency: 'Native' }],
		interests: [{ objectId: id(), name: 'Climbing', keywords: [str('Bouldering')] }],
		references: [{ objectId: id(), name: 'John Smith', reference: 'Great engineer.' }],
		projects: [
			{
				objectId: id(),
				name: 'Inventory service',
				description: 'Event-sourced ledger',
				url: 'https://example.com',
				startDate: new Date(2021, 0, 1),
				endDate: new Date(2022, 0, 1),
				current: false,
				highlights: [str('Handled 1M events/day')],
				keywords: [str('Rust'), str('Postgres')],
				roles: [str('Tech Lead')],
				entity: 'Acme',
				type: 'application'
			}
		]
	};
}
