import type {
	Basics,
	CV,
	StringEntry,
	WorkEntry,
	VolunteerEntry,
	EducationEntry,
	AwardEntry,
	CertificateEntry,
	PublicationEntry,
	SkillCategory,
	LanguageEntry,
	InterestEntry,
	ReferenceEntry,
	ProjectEntry,
	Profile
} from '$lib/types/cv';
import type { CvDocument, JsonResume } from './document.generated';
import { createCV } from '$lib/services/cv/create';
import { createObjectId } from '$lib/types/cv';
import { computeHashes } from '$lib/features/tailoring/hash';
import { APP_BASE_URL } from '$lib/config';

export const SCHEMA_VERSION = '0.1.0';

// --- Scalars (durable: the engine carries Date and id-bearing lists; the wire carries text) ---

function formatDate(d: Date | undefined): string | undefined {
	if (!d) return undefined;
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

function parseDate(s: string | undefined): Date | undefined {
	if (!s) return undefined;
	const parts = s.split('-');
	const year = parseInt(parts[0], 10);
	if (isNaN(year)) return undefined;
	const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
	const day = parts[2] ? parseInt(parts[2], 10) : 1;
	return new Date(year, month, day);
}

/** Drop the ids and empties from a StringEntry list, returning undefined when nothing's left to write. */
function strListToDoc(entries: StringEntry[]): string[] | undefined {
	const out = entries.map((e) => e.value).filter(Boolean);
	return out.length ? out : undefined;
}

/** Mint a fresh-id StringEntry for each bare string coming off the wire. */
function strListFromDoc(values: string[] | undefined): StringEntry[] {
	return (values ?? []).map((value) => ({ objectId: createObjectId(), value }));
}

/** Drop undefined fields so the wire document stays sparse and round-trips cleanly. */
function compact<T extends Record<string, unknown>>(obj: T): T {
	for (const key of Object.keys(obj)) {
		if (obj[key] === undefined) delete obj[key];
	}
	return obj;
}

// --- Location (durable: HumbleHire keeps a free-text location, JSON Resume wants an object) ---

function addressToLocation(doc: CvDocument): string {
	const loc = doc.basics?.location;
	if (!loc) return '';
	if (loc.address) return loc.address;
	return [loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ');
}

// --- Highlights / summary (durable: highlights is a HumbleHire extension; JSON Resume has summary) ---

/**
 * Read highlights back from a document. A HumbleHire JSON file carries them first-class; a plain
 * HumbleHire export stashes the originals in meta and we recover those; a foreign file with only a
 * summary gets that summary split into lines, which is a stopgap until the summary editor lands.
 */
function highlightsFromDoc(doc: CvDocument): StringEntry[] {
	const stash = doc.meta?.humblehire?.highlights;
	if (stash) return strListFromDoc(stash);

	const first = doc.basics?.highlights;
	if (first?.length) return strListFromDoc(first);

	if (!doc.meta?.humblehire && doc.basics?.summary) {
		const lines = doc.basics.summary
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);
		return strListFromDoc(lines);
	}
	return [];
}

/**
 * Read the prose summary back. A plain HumbleHire export stashes the original; a HumbleHire JSON file
 * keeps it first-class; a foreign file's summary was folded into highlights, so nothing is left here.
 */
function summaryFromDoc(doc: CvDocument): string {
	const stash = doc.meta?.humblehire?.summary;
	if (stash !== undefined) return stash;
	if (doc.meta?.humblehire) return doc.basics?.summary ?? '';
	return '';
}

// --- Foreign sections ---

const MAPPED_SECTIONS = new Set([
	'$schema',
	'basics',
	'work',
	'volunteer',
	'education',
	'awards',
	'certificates',
	'publications',
	'skills',
	'languages',
	'interests',
	'references',
	'projects',
	'meta'
]);

/**
 * Top-level keys the importer doesn't read. Every JSON Resume section now maps, so this only ever
 * reports keys outside the JSON Resume schema entirely.
 */
export function unmappedSections(doc: CvDocument): string[] {
	return Object.keys(doc as Record<string, unknown>).filter((k) => !MAPPED_SECTIONS.has(k));
}

// --- Export: HumbleHire JSON (lossless) ---

function basicsToDoc(b: Basics): NonNullable<CvDocument['basics']> {
	const location = b.location.trim();
	const basics: NonNullable<CvDocument['basics']> = compact({
		name: b.fullName.trim() || undefined,
		label: b.position.trim() || undefined,
		image: b.image || undefined,
		email: b.email || undefined,
		phone: b.phone || undefined,
		url: b.url || undefined,
		summary: b.summary.trim() || undefined,
		highlights: strListToDoc(b.highlights),
		location: location ? { address: location } : undefined,
		profiles: b.profiles.length ? b.profiles.map(profileToDoc) : undefined
	});
	return basics;
}

function profileToDoc(
	p: Profile
): NonNullable<NonNullable<JsonResume['basics']>['profiles']>[number] {
	return compact({
		network: p.network || undefined,
		username: p.username,
		url: p.url || undefined
	});
}

function workToDoc(w: WorkEntry) {
	return compact({
		name: w.name || undefined,
		position: w.position || undefined,
		location: w.location,
		description: w.description,
		url: w.url,
		startDate: formatDate(w.startDate),
		endDate: w.current ? undefined : formatDate(w.endDate),
		current: w.current,
		summary: w.summary,
		highlights: strListToDoc(w.highlights),
		keywords: strListToDoc(w.keywords)
	});
}

function volunteerToDoc(v: VolunteerEntry) {
	return compact({
		organization: v.organization || undefined,
		position: v.position || undefined,
		url: v.url,
		startDate: formatDate(v.startDate),
		endDate: v.current ? undefined : formatDate(v.endDate),
		current: v.current,
		summary: v.summary,
		highlights: strListToDoc(v.highlights)
	});
}

function educationToDoc(e: EducationEntry) {
	return compact({
		institution: e.institution || undefined,
		url: e.url,
		studyType: e.studyType || undefined,
		area: e.area || undefined,
		startDate: formatDate(e.startDate),
		endDate: e.current ? undefined : formatDate(e.endDate),
		current: e.current,
		score: e.score,
		courses: strListToDoc(e.courses)
	});
}

function awardToDoc(a: AwardEntry) {
	return compact({
		title: a.title || undefined,
		date: formatDate(a.date),
		awarder: a.awarder,
		summary: a.summary
	});
}

function certificateToDoc(c: CertificateEntry) {
	return compact({
		name: c.name || undefined,
		date: formatDate(c.date),
		url: c.url,
		issuer: c.issuer
	});
}

function publicationToDoc(p: PublicationEntry) {
	return compact({
		name: p.name || undefined,
		publisher: p.publisher,
		releaseDate: formatDate(p.releaseDate),
		url: p.url,
		summary: p.summary
	});
}

function skillToDoc(s: SkillCategory) {
	return compact({ name: s.name || undefined, level: s.level, keywords: strListToDoc(s.keywords) });
}

function languageToDoc(l: LanguageEntry) {
	return compact({ language: l.language || undefined, fluency: l.fluency });
}

function interestToDoc(i: InterestEntry) {
	return compact({ name: i.name || undefined, keywords: strListToDoc(i.keywords) });
}

function referenceToDoc(r: ReferenceEntry) {
	return compact({ name: r.name || undefined, reference: r.reference || undefined });
}

function projectToDoc(p: ProjectEntry) {
	return compact({
		name: p.name || undefined,
		description: p.description || undefined,
		url: p.url || undefined,
		startDate: formatDate(p.startDate),
		endDate: p.current ? undefined : formatDate(p.endDate),
		current: p.current,
		highlights: strListToDoc(p.highlights),
		keywords: strListToDoc(p.keywords),
		roles: strListToDoc(p.roles),
		entity: p.entity,
		type: p.type
	});
}

/** Serialize a CV to the lossless HumbleHire JSON document, with every section as near-identity. */
export function toDocument(cv: CV): CvDocument {
	const c = cv.content;
	const doc: CvDocument = { $schema: `${APP_BASE_URL}/schema/resume/v${SCHEMA_VERSION}.json` };

	const basics = basicsToDoc(c.basics);
	if (Object.keys(basics).length) doc.basics = basics;

	if (c.work.length) doc.work = c.work.map(workToDoc);
	if (c.volunteer.length) doc.volunteer = c.volunteer.map(volunteerToDoc);
	if (c.education.length) doc.education = c.education.map(educationToDoc);
	if (c.awards.length) doc.awards = c.awards.map(awardToDoc);
	if (c.certificates.length) doc.certificates = c.certificates.map(certificateToDoc);
	if (c.publications.length) doc.publications = c.publications.map(publicationToDoc);
	if (c.skills.length) doc.skills = c.skills.map(skillToDoc);
	if (c.languages.length) doc.languages = c.languages.map(languageToDoc);
	if (c.interests.length) doc.interests = c.interests.map(interestToDoc);
	if (c.references.length) doc.references = c.references.map(referenceToDoc);
	if (c.projects.length) doc.projects = c.projects.map(projectToDoc);

	doc.meta = { humblehire: { schemaVersion: SCHEMA_VERSION } };
	return doc;
}

// --- Export: JSON Resume projection (lossy, durable interop) ---

/**
 * Serialize a CV to plain JSON Resume. Highlights and any prose summary fold into the standard
 * summary string, and work keywords drop, since neither survives a JSON Resume consumer. The
 * originals are stashed under meta.humblehire so re-importing this file recovers them exactly.
 */
export function toJsonResume(cv: CV): CvDocument {
	const doc = toDocument(cv);
	const highlights = cv.content.basics.highlights.map((h) => h.value).filter(Boolean);
	const summary = cv.content.basics.summary.trim();

	if (doc.basics) {
		const folded = [summary, ...highlights].filter(Boolean).join('\n');
		if (folded) doc.basics.summary = folded;
		else delete doc.basics.summary;
		delete doc.basics.highlights;
	}

	for (const item of doc.work ?? []) delete item.keywords;

	doc.$schema = 'https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json';
	doc.meta = {
		humblehire: compact({
			schemaVersion: SCHEMA_VERSION,
			highlights: highlights.length ? highlights : undefined,
			summary: summary || undefined
		})
	};
	return doc;
}

// --- Import ---

/** Build a fresh CV from a document, minting ids and reading every JSON Resume section back in. */
export function fromDocument(doc: CvDocument): CV {
	const name = doc.basics?.name?.trim() || 'Imported CV';
	const cv = createCV({ name });

	cv.content.basics = {
		fullName: doc.basics?.name?.trim() ?? '',
		position: doc.basics?.label?.trim() ?? '',
		image: doc.basics?.image || undefined,
		location: addressToLocation(doc),
		summary: summaryFromDoc(doc),
		highlights: highlightsFromDoc(doc),
		email: doc.basics?.email ?? '',
		phone: doc.basics?.phone ?? '',
		url: doc.basics?.url ?? '',
		profiles: (doc.basics?.profiles ?? []).map((p) => ({
			objectId: createObjectId(),
			network: p.network ?? '',
			username: p.username,
			url: p.url ?? ''
		}))
	};

	cv.content.work = (doc.work ?? []).map((w) => ({
		objectId: createObjectId(),
		name: w.name ?? '',
		position: w.position ?? '',
		location: w.location,
		description: w.description,
		url: w.url,
		startDate: parseDate(w.startDate),
		endDate: parseDate(w.endDate),
		current: currentFlag(w),
		summary: w.summary,
		highlights: strListFromDoc(w.highlights),
		keywords: strListFromDoc((w as { keywords?: string[] }).keywords)
	}));

	cv.content.volunteer = (doc.volunteer ?? []).map((v) => ({
		objectId: createObjectId(),
		organization: v.organization ?? '',
		position: v.position ?? '',
		url: v.url,
		startDate: parseDate(v.startDate),
		endDate: parseDate(v.endDate),
		current: currentFlag(v),
		summary: v.summary,
		highlights: strListFromDoc(v.highlights)
	}));

	cv.content.education = (doc.education ?? []).map((e) => ({
		objectId: createObjectId(),
		institution: e.institution ?? '',
		url: e.url,
		studyType: e.studyType ?? '',
		area: e.area ?? '',
		startDate: parseDate(e.startDate),
		endDate: parseDate(e.endDate),
		current: currentFlag(e),
		score: e.score,
		courses: strListFromDoc(e.courses)
	}));

	cv.content.awards = (doc.awards ?? []).map((a) => ({
		objectId: createObjectId(),
		title: a.title ?? '',
		date: parseDate(a.date),
		awarder: a.awarder,
		summary: a.summary
	}));

	cv.content.certificates = (doc.certificates ?? []).map((c) => ({
		objectId: createObjectId(),
		name: c.name ?? '',
		date: parseDate(c.date),
		url: c.url,
		issuer: c.issuer
	}));

	cv.content.publications = (doc.publications ?? []).map((p) => ({
		objectId: createObjectId(),
		name: p.name ?? '',
		publisher: p.publisher,
		releaseDate: parseDate(p.releaseDate),
		url: p.url,
		summary: p.summary
	}));

	cv.content.skills = (doc.skills ?? []).map((s) => ({
		objectId: createObjectId(),
		name: s.name ?? '',
		level: s.level,
		keywords: strListFromDoc(s.keywords)
	}));

	cv.content.languages = (doc.languages ?? []).map((l) => ({
		objectId: createObjectId(),
		language: l.language ?? '',
		fluency: l.fluency
	}));

	cv.content.interests = (doc.interests ?? []).map((i) => ({
		objectId: createObjectId(),
		name: i.name ?? '',
		keywords: strListFromDoc(i.keywords)
	}));

	cv.content.references = (doc.references ?? []).map((r) => ({
		objectId: createObjectId(),
		name: r.name ?? '',
		reference: r.reference ?? ''
	}));

	cv.content.projects = (doc.projects ?? []).map((p) => ({
		objectId: createObjectId(),
		name: p.name ?? '',
		description: p.description ?? '',
		url: p.url ?? '',
		startDate: parseDate(p.startDate),
		endDate: parseDate(p.endDate),
		current: currentFlag(p),
		highlights: strListFromDoc(p.highlights),
		keywords: strListFromDoc(p.keywords),
		roles: strListFromDoc(p.roles),
		entity: p.entity,
		type: p.type
	}));

	cv.hashes = computeHashes(cv.content);
	return cv;
}

/** A timed entry is current when it says so, or — JSON Resume style — when it has a start but no end. */
function currentFlag(entry: { startDate?: string; endDate?: string; current?: boolean }): boolean {
	return entry.current ?? (!!entry.startDate && !entry.endDate);
}
