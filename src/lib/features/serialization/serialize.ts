import type {
	CV,
	ContactEntry,
	JobEntry,
	EducationEntry,
	SkillCategory,
	ProjectEntry
} from '$lib/types/cv';
import type { CvDocument, JsonResume } from './document.generated';
import { createCV } from '$lib/services/cv/create';
import { createObjectId } from '$lib/types/cv';
import { APP_BASE_URL } from '$lib/config';

// --- Date helpers (durable: engine uses Date; wire uses YYYY-MM text) ---

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

// --- Contacts @temporal-coercion — remove with model refactor (typed contacts) ---

function contactsToStandardFields(
	contacts: ContactEntry[]
): Pick<NonNullable<JsonResume['basics']>, 'email' | 'phone' | 'url' | 'profiles'> {
	let email: string | undefined;
	let phone: string | undefined;
	let url: string | undefined;
	const profiles: Array<{ network?: string; url?: string; username?: string }> = [];

	for (const c of contacts) {
		const l = c.label.toLowerCase();
		if (!email && (l === 'email' || l === 'e-mail')) {
			email = c.value;
		} else if (!phone && (l === 'phone' || l === 'mobile' || l === 'tel')) {
			phone = c.value;
		} else if (!url && (l === 'website' || l === 'site' || l === 'url' || l === 'homepage')) {
			url = c.value;
		} else {
			profiles.push({ network: c.label, url: c.value });
		}
	}

	return { email, phone, url, profiles: profiles.length ? profiles : undefined };
}

function standardFieldsToContacts(doc: CvDocument): ContactEntry[] {
	const stash = doc.meta?.humblehire?.contacts;
	if (stash && stash.length > 0) {
		return stash.map((c) => ({ objectId: createObjectId(), label: c.label, value: c.value }));
	}

	const contacts: ContactEntry[] = [];
	const b = doc.basics;
	if (!b) return contacts;

	if (b.email) contacts.push({ objectId: createObjectId(), label: 'Email', value: b.email });
	if (b.phone) contacts.push({ objectId: createObjectId(), label: 'Phone', value: b.phone });
	if (b.url) contacts.push({ objectId: createObjectId(), label: 'Website', value: b.url });
	for (const p of b.profiles ?? []) {
		contacts.push({
			objectId: createObjectId(),
			label: p.network ?? 'Profile',
			value: p.url ?? p.username ?? ''
		});
	}
	return contacts;
}

// --- Location @temporal-coercion — remove with model refactor (structured location) ---

function locationToAddress(loc: string) {
	return { location: { address: loc } };
}

function addressToLocation(doc: CvDocument): string {
	const loc = doc.basics?.location;
	if (!loc) return '';
	if (loc.address) return loc.address;
	return [loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ');
}

// --- Highlights (durable: highlights block has no equivalent in JSON Resume) ---

function highlightsToSummary(highlights: string[]): string {
	return highlights.join('\n');
}

function summaryToHighlights(doc: CvDocument): string[] {
	const h = doc.basics?.highlights;
	if (h && h.length > 0) return h;
	const s = doc.basics?.summary;
	if (!s) return [];
	return s
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean);
}

// --- Unmapped foreign sections ---

const MAPPED_SECTIONS = new Set([
	'$schema',
	'basics',
	'work',
	'education',
	'skills',
	'projects',
	'meta'
]);

export function unmappedSections(doc: CvDocument): string[] {
	return Object.keys(doc as Record<string, unknown>).filter((k) => !MAPPED_SECTIONS.has(k));
}

// --- Export: HumbleHire JSON (lossless) ---

export function toDocument(cv: CV): CvDocument {
	const b = cv.blocks;
	const contacts = b.contacts.value;
	const highlights = b.highlights.value.map((h) => h.text).filter(Boolean);
	const location = b.location.value.trim();
	const jobHistory = b.jobHistory.value;
	const education = b.education.value;
	const skills = b.skills.value;
	const projects = b.projects.value;

	const basics: NonNullable<CvDocument['basics']> = {};
	// @temporal-coercion field renames — remove with model refactor
	if (b.fullName.value.trim()) basics.name = b.fullName.value.trim();
	if (b.position.value.trim()) basics.label = b.position.value.trim();
	if (highlights.length) basics.highlights = highlights;
	if (location) Object.assign(basics, locationToAddress(location));
	if (contacts.length) {
		const std = contactsToStandardFields(contacts);
		if (std.email) basics.email = std.email;
		if (std.phone) basics.phone = std.phone;
		if (std.url) basics.url = std.url;
		if (std.profiles?.length) basics.profiles = std.profiles;
	}

	const doc: CvDocument = { $schema: `${APP_BASE_URL}/schema/resume/v0.0.1.json` };
	if (Object.keys(basics).length) doc.basics = basics;

	if (jobHistory.length) {
		doc.work = jobHistory.map((j: JobEntry) => {
			const hl = j.achievements.map((a) => a.text).filter(Boolean);
			const kw = j.skills.map((s) => s.value).filter(Boolean);
			return {
				// @temporal-coercion field renames — remove with model refactor
				name: j.company || undefined,
				position: j.role || undefined,
				startDate: formatDate(j.startDate),
				endDate: j.current ? undefined : formatDate(j.endDate),
				...(hl.length && { highlights: hl }),
				...(kw.length && { keywords: kw })
			};
		});
	}

	if (education.length) {
		doc.education = education.map((e: EducationEntry) => ({
			// @temporal-coercion field rename + degree split — remove with model refactor
			institution: e.institution || undefined,
			studyType: e.degree || undefined,
			startDate: formatDate(e.startDate),
			endDate: e.current ? undefined : formatDate(e.endDate)
		}));
	}

	if (skills.length) {
		doc.skills = skills
			.filter((s: SkillCategory) => s.skills.length > 0)
			.map((s: SkillCategory) => ({
				name: s.name || undefined,
				keywords: s.skills.map((t) => t.value).filter(Boolean)
			}));
	}

	if (projects.length) {
		doc.projects = projects.map((p: ProjectEntry) => ({
			// @temporal-coercion field renames — remove with model refactor
			name: p.name || undefined,
			description: p.description || undefined,
			keywords: p.stack.map((t) => t.value).filter(Boolean) || undefined,
			url: p.link || undefined
		}));
	}

	const contactStash = contacts.map((c) => ({
		label: c.label,
		value: c.value
	}));
	doc.meta = {
		humblehire: {
			schemaVersion: '0.0.1',
			...(contactStash.length ? { contacts: contactStash } : {})
		}
	};

	return doc;
}

// --- Export: JSON Resume projection (lossy, durable interop) ---

export function toJsonResume(cv: CV): CvDocument {
	const doc = toDocument(cv);

	if (doc.basics) {
		if (doc.basics.highlights?.length) {
			doc.basics.summary = highlightsToSummary(doc.basics.highlights);
		}
		delete doc.basics.highlights;
	}

	if (doc.work) {
		for (const item of doc.work) {
			delete item.keywords;
		}
	}

	doc.$schema = 'https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json';
	delete doc.meta;

	return doc;
}

// --- Import ---

export function fromDocument(doc: CvDocument): CV {
	const name = doc.basics?.name?.trim() || 'Imported CV';
	const cv = createCV({ name });

	// @temporal-coercion field renames — remove with model refactor
	cv.blocks.fullName.value = doc.basics?.name?.trim() ?? '';
	cv.blocks.position.value = doc.basics?.label?.trim() ?? '';
	cv.blocks.location.value = addressToLocation(doc);
	cv.blocks.highlights.value = summaryToHighlights(doc).map((text) => ({
		objectId: createObjectId(),
		text
	}));
	cv.blocks.contacts.value = standardFieldsToContacts(doc);

	cv.blocks.jobHistory.value = (doc.work ?? []).map((w) => ({
		objectId: createObjectId(),
		// @temporal-coercion field renames — remove with model refactor
		company: w.name ?? '',
		role: w.position ?? '',
		startDate: parseDate(w.startDate),
		endDate: parseDate(w.endDate),
		current: !!w.startDate && !w.endDate,
		achievements: (w.highlights ?? []).map((text) => ({ objectId: createObjectId(), text })),
		skills: ((w as { keywords?: string[] }).keywords ?? []).map((value) => ({
			objectId: createObjectId(),
			value
		}))
	}));

	cv.blocks.education.value = (doc.education ?? []).map((e) => ({
		objectId: createObjectId(),
		institution: e.institution ?? '',
		// @temporal-coercion degree join (studyType + area) — remove with model refactor
		degree: [e.studyType, e.area].filter(Boolean).join(' '),
		startDate: parseDate(e.startDate),
		endDate: parseDate(e.endDate),
		current: !!e.startDate && !e.endDate
	}));

	cv.blocks.skills.value = (doc.skills ?? []).map((s) => ({
		objectId: createObjectId(),
		name: s.name ?? '',
		skills: (s.keywords ?? []).map((value) => ({ objectId: createObjectId(), value }))
	}));

	cv.blocks.projects.value = (doc.projects ?? []).map((p) => ({
		objectId: createObjectId(),
		// @temporal-coercion field renames — remove with model refactor
		name: p.name ?? '',
		description: p.description ?? '',
		stack: (p.keywords ?? []).map((value) => ({ objectId: createObjectId(), value })),
		link: p.url ?? ''
	}));

	return cv;
}
