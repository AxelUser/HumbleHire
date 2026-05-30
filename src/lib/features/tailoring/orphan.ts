import type { CV } from '$lib/types/cv';

export function orphanTailored(cv: CV): CV {
	return {
		...cv,
		sourceId: undefined,
		syncBaseline: undefined,
		syncBaselineHashes: undefined
	};
}
