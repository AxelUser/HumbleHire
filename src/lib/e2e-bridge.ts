import { db } from '$lib/db/index';
import { createDummyCV } from '$lib/components/dev/dummy-cv';
import { createTailoredCV } from '$lib/features/tailoring/create-tailored';
import { computeBlockHashes } from '$lib/features/tailoring/hash';
import { setHasCvsHint } from '$lib/services/cv/has-cvs-hint';
import { createObjectId } from '$lib/types/cv';
import type { HhTestBridge, MasterSeedContent } from '@humblehire/test-bridge';

// The bridge contract lives in @humblehire/test-bridge so the app, the e2e suite,
// and the docs-asset harness all share one definition. This module implements it;
// the out-of-process consumers drive it via `useBridge`. Re-exported so existing
// `$lib/e2e-bridge` importers (e.g. app.d.ts) keep resolving the types here.
export type { HhTestBridge, MasterSeedContent };

export function initE2eBridge(): void {
	const bridge: HhTestBridge = {
		async reset() {
			await db.cvs.clear();
			setHasCvsHint(false);
		},

		async seedMaster(overrides) {
			const cv = createDummyCV();
			if (overrides?.name) cv.name = overrides.name;

			const c = overrides?.content;
			if (c) {
				if (c.fullName !== undefined) cv.blocks.fullName.value = c.fullName;
				if (c.position !== undefined) cv.blocks.position.value = c.position;
				if (c.location !== undefined) cv.blocks.location.value = c.location;
				if (c.contacts) {
					cv.blocks.contacts.value = c.contacts.map(({ label, value }) => ({
						objectId: createObjectId(),
						label,
						value
					}));
				}
				if (c.highlights) {
					cv.blocks.highlights.value = c.highlights.map(({ text }) => ({
						objectId: createObjectId(),
						text
					}));
				}
				if (c.skills) {
					cv.blocks.skills.value = c.skills.map(({ name, skills }) => ({
						objectId: createObjectId(),
						name,
						skills: skills.map((tag) => ({ objectId: createObjectId(), value: tag }))
					}));
				}
				if (c.jobHistory) {
					cv.blocks.jobHistory.value = c.jobHistory.map((j) => ({
						objectId: createObjectId(),
						company: j.company,
						role: j.role,
						startDate: j.startDate ? new Date(j.startDate) : undefined,
						endDate: j.endDate ? new Date(j.endDate) : undefined,
						current: j.current ?? false,
						achievements: (j.achievements ?? []).map((a) => ({
							objectId: createObjectId(),
							text: a.text
						})),
						skills: (j.skills ?? []).map((tag) => ({ objectId: createObjectId(), value: tag }))
					}));
				}
				if (c.projects) {
					cv.blocks.projects.value = c.projects.map((p) => ({
						objectId: createObjectId(),
						name: p.name,
						description: p.description,
						stack: (p.stack ?? []).map((tag) => ({ objectId: createObjectId(), value: tag })),
						link: p.link ?? ''
					}));
				}
				if (c.education) {
					cv.blocks.education.value = c.education.map((e) => ({
						objectId: createObjectId(),
						institution: e.institution,
						degree: e.degree,
						startDate: e.startDate ? new Date(e.startDate) : undefined,
						endDate: e.endDate ? new Date(e.endDate) : undefined,
						current: e.current ?? false
					}));
				}
				cv.blockHashes = computeBlockHashes(cv.blocks);
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
			if (textPatches.fullName !== undefined) cv.blocks.fullName.value = textPatches.fullName;
			if (textPatches.position !== undefined) cv.blocks.position.value = textPatches.position;
			if (textPatches.location !== undefined) cv.blocks.location.value = textPatches.location;
			cv.blockHashes = computeBlockHashes(cv.blocks);
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
				syncBaseline: base.blocks,
				syncBaselineHashes: base.blockHashes
			};
			await db.cvs.add(cv);
			setHasCvsHint(true);
			return cv.id;
		},

		async getCv(id) {
			return db.cvs.get(id);
		}
	};

	window.__hhTest = bridge;
}
