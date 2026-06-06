import { createId } from '$lib/id.js';

export type ObjectId = string & { readonly __brand: 'ObjectId' };

export function createObjectId(): ObjectId {
	return createId() as ObjectId;
}

export interface WithId {
	objectId: ObjectId;
}

/**
 * A list item that is a bare string but carries an id internally so the
 * sync engine can match it by identity (e.g. highlights, keywords, courses, roles).
 */
export interface StringEntry extends WithId {
	value: string;
}

export interface Profile extends WithId {
	network: string;
	username?: string;
	url: string;
}

export interface Basics {
	fullName: string; // JSON Resume basics.name
	position: string; // basics.label
	image?: string; // URL to a photo
	location: string; // kept a plain string deliberately
	summary: string; // reserved; highlights drives the UI for now
	highlights: StringEntry[];
	email: string;
	phone: string;
	url: string;
	profiles: Profile[]; // custom labels live in `network`
}

export interface WorkEntry extends WithId {
	name: string; // employer/entity; may be "Freelance", a gap, etc.
	position: string;
	location?: string;
	description?: string; // e.g. "Social Media Company" (work[].description)
	url?: string;
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	summary?: string;
	highlights: StringEntry[];
	keywords: StringEntry[];
}

export interface VolunteerEntry extends WithId {
	organization: string;
	position: string;
	url?: string;
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	summary?: string;
	highlights: StringEntry[];
}

export interface EducationEntry extends WithId {
	institution: string;
	url?: string;
	// Required at runtime (editor-bound; '' when unset) though optional on the wire.
	studyType: string;
	area: string;
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	score?: string;
	courses: StringEntry[];
}

export interface AwardEntry extends WithId {
	title: string;
	date?: Date;
	awarder?: string;
	summary?: string;
}

export interface CertificateEntry extends WithId {
	name: string;
	date?: Date;
	url?: string;
	issuer?: string;
}

export interface PublicationEntry extends WithId {
	name: string;
	publisher?: string;
	releaseDate?: Date;
	url?: string;
	summary?: string;
}

export interface SkillCategory extends WithId {
	name: string;
	level?: string;
	keywords: StringEntry[];
}

export interface LanguageEntry extends WithId {
	language: string;
	fluency?: string;
}

export interface InterestEntry extends WithId {
	name: string;
	keywords: StringEntry[];
}

export interface ReferenceEntry extends WithId {
	name: string;
	reference: string;
}

export interface ProjectEntry extends WithId {
	name: string;
	description: string;
	// Required at runtime (editor-bound; '' when unset) though optional on the wire.
	url: string;
	startDate?: Date;
	endDate?: Date;
	current: boolean;
	highlights: StringEntry[];
	keywords: StringEntry[];
	roles: StringEntry[];
	entity?: string;
	type?: string;
}

/**
 * Presentation-free resume data, grouped into the full JSON Resume section set.
 * Block order, on-page grouping, and layout are presentation concerns and live
 * with the theme, never here. See ADR-010.
 */
export interface CVContent {
	basics: Basics;
	work: WorkEntry[];
	volunteer: VolunteerEntry[];
	education: EducationEntry[];
	awards: AwardEntry[];
	certificates: CertificateEntry[];
	publications: PublicationEntry[];
	skills: SkillCategory[];
	languages: LanguageEntry[];
	interests: InterestEntry[];
	references: ReferenceEntry[];
	projects: ProjectEntry[];
}

export type SectionKey = keyof CVContent;

/** Per-section canonical hash, a derived cache refreshed at the content-write chokepoint. */
export type SectionHashes = Record<SectionKey, string>;

export interface CV {
	id: string;
	name: string;
	company?: string;
	createdAt: number;
	updatedAt: number;
	content: CVContent;
	hidden: string[]; // canonical-encoded section/field/entry paths
	hashes: SectionHashes;

	sourceId?: string;
	baseline?: CVContent; // snapshot of master content at last sync
	baselineHashes?: SectionHashes;
}
