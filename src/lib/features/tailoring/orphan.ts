import type { CV } from '$lib/types/cv';

export function orphanTailored(cv: CV): CV {
	const { sourceId: _sourceId, baseline: _baseline, baselineHashes: _baselineHashes, ...rest } = cv;
	return rest;
}
