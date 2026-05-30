import type { CV, CVBlocks, ObjectId } from '$lib/types/cv';
import { computeBlockHashes } from '$lib/features/tailoring/hash';

function id(slug: string): ObjectId {
	return slug as ObjectId;
}

export function mkBlocks(name = '', position = '', location = ''): CVBlocks {
	return {
		fullName: { objectId: id(`${name}-fn`), value: name },
		position: { objectId: id(`${name}-pos`), value: position },
		location: { objectId: id(`${name}-loc`), value: location },
		contacts: { objectId: id(`${name}-cb`), value: [] },
		highlights: { objectId: id(`${name}-hb`), value: [] },
		skills: { objectId: id(`${name}-sb`), value: [] },
		jobHistory: { objectId: id(`${name}-jb`), value: [] },
		projects: { objectId: id(`${name}-pb`), value: [] },
		education: { objectId: id(`${name}-eb`), value: [] }
	};
}

const now = Date.now();

const masterBlocks = mkBlocks('Aleksey Maltsev', 'Software Engineer', 'San Francisco, CA');
const masterHashes = computeBlockHashes(masterBlocks);

export const masterCv: CV = {
	id: 'master-1',
	name: 'Software Engineer',
	createdAt: now - 86400000 * 14,
	updatedAt: now - 86400000 * 4,
	blocks: masterBlocks,
	blockHashes: masterHashes,
	hiddenBlockIds: []
};

const syncedTailoredBlocks = mkBlocks(
	'Aleksey Maltsev',
	'Senior Frontend Engineer',
	'San Francisco, CA'
);
export const syncedTailored: CV = {
	id: 'tailored-1',
	name: 'Senior Frontend Engineer',
	company: 'Stripe',
	createdAt: now - 86400000 * 5,
	updatedAt: now,
	blocks: syncedTailoredBlocks,
	blockHashes: computeBlockHashes(syncedTailoredBlocks),
	hiddenBlockIds: [],
	sourceId: 'master-1',
	syncBaseline: masterBlocks,
	syncBaselineHashes: masterHashes
};

const staleTailoredBlocks = mkBlocks('Aleksey Maltsev', 'SWE L5', 'Mountain View, CA');
const staleBaselineBlocks = mkBlocks('Aleksey Maltsev', 'Older Title', 'Mountain View, CA');
const staleBaselineHashes = computeBlockHashes(staleBaselineBlocks);
export const staleTailored: CV = {
	id: 'tailored-2',
	name: 'SWE L5',
	company: 'Google',
	createdAt: now - 86400000 * 9,
	updatedAt: now - 86400000 * 9,
	blocks: staleTailoredBlocks,
	blockHashes: computeBlockHashes(staleTailoredBlocks),
	hiddenBlockIds: [],
	sourceId: 'master-1',
	syncBaseline: staleBaselineBlocks,
	syncBaselineHashes: staleBaselineHashes
};

const masterCv2Blocks = mkBlocks('Aleksey Maltsev', 'Product Manager', 'New York, NY');
export const masterCv2: CV = {
	id: 'master-2',
	name: 'Product Manager',
	createdAt: now - 86400000 * 30,
	updatedAt: now - 86400000 * 7,
	blocks: masterCv2Blocks,
	blockHashes: computeBlockHashes(masterCv2Blocks),
	hiddenBlockIds: []
};
