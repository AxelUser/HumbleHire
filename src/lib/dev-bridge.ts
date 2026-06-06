import { db } from '$lib/db/index';
import { createDummyCV } from '$lib/components/dev/dummy-cv';
import { createTailoredCV } from '$lib/features/tailoring/create-tailored';
import { computeHashes } from '$lib/features/tailoring/hash';
import { setHasCvsHint } from '$lib/services/cv/has-cvs-hint';
import { createObjectId, type Basics, type StringEntry } from '$lib/types/cv';
import type { DevBridge, MasterSeedContent } from '@humblehire/dev-bridge';

// The bridge contract lives in @humblehire/dev-bridge so the app, the e2e suite,
// and the docs-asset harness all share one definition. This module implements it;
// the out-of-process consumers drive it via `useBridge`. The seed contract still speaks
// the pre-refactor block vocabulary, so this module maps it onto the content model.
export type { DevBridge, MasterSeedContent };

function strs(values: string[]): StringEntry[] {
	return values.map((value) => ({ objectId: createObjectId(), value }));
}

/** Fold the seed's freeform label:value contacts into the typed basics fields. */
function applyContacts(basics: Basics, contacts: { label: string; value: string }[]): void {
	for (const { label, value } of contacts) {
		const l = label.toLowerCase();
		if (!basics.email && (l === 'email' || l === 'e-mail')) basics.email = value;
		else if (!basics.phone && (l === 'phone' || l === 'mobile' || l === 'tel'))
			basics.phone = value;
		else if (!basics.url && (l === 'website' || l === 'site' || l === 'url' || l === 'homepage'))
			basics.url = value;
		else basics.profiles.push({ objectId: createObjectId(), network: label, url: value });
	}
}

export function initDevBridge(): void {
	const bridge: DevBridge = {
		async reset() {
			await db.cvs.clear();
			setHasCvsHint(false);
		},

		async seedMaster(overrides) {
			const cv = createDummyCV();
			if (overrides?.name) cv.name = overrides.name;

			const c = overrides?.content;
			if (c) {
				const b = cv.content.basics;
				if (c.fullName !== undefined) b.fullName = c.fullName;
				if (c.position !== undefined) b.position = c.position;
				if (c.location !== undefined) b.location = c.location;
				if (c.contacts) {
					b.email = '';
					b.phone = '';
					b.url = '';
					b.profiles = [];
					applyContacts(b, c.contacts);
				}
				if (c.highlights) b.highlights = strs(c.highlights.map((h) => h.text));
				if (c.skills) {
					cv.content.skills = c.skills.map(({ name, skills }) => ({
						objectId: createObjectId(),
						name,
						keywords: strs(skills)
					}));
				}
				if (c.jobHistory) {
					cv.content.work = c.jobHistory.map((j) => ({
						objectId: createObjectId(),
						name: j.company,
						position: j.role,
						startDate: j.startDate ? new Date(j.startDate) : undefined,
						endDate: j.endDate ? new Date(j.endDate) : undefined,
						current: j.current ?? false,
						highlights: strs((j.achievements ?? []).map((a) => a.text)),
						keywords: strs(j.skills ?? [])
					}));
				}
				if (c.projects) {
					cv.content.projects = c.projects.map((p) => ({
						objectId: createObjectId(),
						name: p.name,
						description: p.description,
						current: false,
						highlights: [],
						keywords: strs(p.stack ?? []),
						roles: [],
						url: p.link ?? ''
					}));
				}
				if (c.education) {
					cv.content.education = c.education.map((e) => ({
						objectId: createObjectId(),
						institution: e.institution,
						studyType: e.degree,
						area: '',
						startDate: e.startDate ? new Date(e.startDate) : undefined,
						endDate: e.endDate ? new Date(e.endDate) : undefined,
						current: e.current ?? false,
						courses: []
					}));
				}
				cv.hashes = computeHashes(cv.content);
				cv.updatedAt = Date.now();
			}

			await db.cvs.add(cv);
			setHasCvsHint(true);
			return cv.id;
		},

		async seedTailored(masterId, opts) {
			const master = await db.cvs.get(masterId);
			if (!master) throw new Error(`Master CV ${masterId} not found`);
			return createTailoredCV(master, opts?.name ?? `${master.name} — Tailored`, opts?.company);
		},

		async patchMaster(id, textPatches) {
			const cv = await db.cvs.get(id);
			if (!cv) throw new Error(`CV ${id} not found`);
			const b = cv.content.basics;
			if (textPatches.fullName !== undefined) b.fullName = textPatches.fullName;
			if (textPatches.position !== undefined) b.position = textPatches.position;
			if (textPatches.location !== undefined) b.location = textPatches.location;
			cv.hashes = computeHashes(cv.content);
			cv.updatedAt = Date.now();
			await db.cvs.put(cv);
		},

		async seedOrphanedTailored(opts) {
			const base = createDummyCV();
			if (opts?.name) base.name = opts.name;
			// sourceId points to a non-existent master — triggers the silent orphan path on open
			const cv = {
				...base,
				sourceId: 'nonexistent-master-id',
				baseline: base.content,
				baselineHashes: base.hashes
			};
			await db.cvs.add(cv);
			setHasCvsHint(true);
			return cv.id;
		},

		async getCv(id) {
			return db.cvs.get(id);
		}
	};

	window.__devBridge = bridge;
}
