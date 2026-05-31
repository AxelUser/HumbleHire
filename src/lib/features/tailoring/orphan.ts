import type { CV } from '$lib/types/cv';

export function orphanTailored(cv: CV): CV {
	const {
		sourceId: _sourceId,
		syncBaseline: _syncBaseline,
		syncBaselineHashes: _syncBaselineHashes,
		...rest
	} = cv;
	return rest;
}
