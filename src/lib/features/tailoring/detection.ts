import type { CV, CVBlockKey } from '$lib/types/cv';

const BLOCK_KEYS: readonly CVBlockKey[] = [
	'fullName',
	'position',
	'location',
	'contacts',
	'highlights',
	'skills',
	'jobHistory',
	'projects',
	'education'
] as const;

export function hasUpdatesAvailable(master: CV, tailored: CV): boolean {
	const baseline = tailored.syncBaselineHashes;
	if (!baseline) return false;

	const masterHidden = new Set(master.hiddenBlockIds);
	const tailoredHidden = new Set(tailored.hiddenBlockIds);

	for (const key of BLOCK_KEYS) {
		const blockObjectId = master.blocks[key].objectId;
		if (masterHidden.has(blockObjectId)) continue;
		if (tailoredHidden.has(blockObjectId)) continue;
		if (master.blockHashes[key] !== baseline[key]) return true;
	}

	return false;
}
