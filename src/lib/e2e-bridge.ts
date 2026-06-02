import { db } from '$lib/db/index';
import { createDummyCV } from '$lib/components/dev/dummy-cv';
import { createTailoredCV } from '$lib/features/tailoring/create-tailored';
import { computeBlockHashes } from '$lib/features/tailoring/hash';
import { setHasCvsHint } from '$lib/services/cv/has-cvs-hint';

export interface HhTestBridge {
	reset(): Promise<void>;
	seedMaster(overrides?: { name?: string }): Promise<string>;
	seedTailored(masterId: string, opts?: { name?: string; company?: string }): Promise<string>;
	patchMaster(
		id: string,
		textPatches: { fullName?: string; position?: string; location?: string }
	): Promise<void>;
	seedOrphanedTailored(opts?: { name?: string }): Promise<string>;
	getCv(id: string): Promise<unknown>;
}

export function initE2eBridge(): void {
	const bridge: HhTestBridge = {
		async reset() {
			await db.cvs.clear();
			setHasCvsHint(false);
		},

		async seedMaster(overrides) {
			const cv = createDummyCV();
			if (overrides?.name) cv.name = overrides.name;
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
