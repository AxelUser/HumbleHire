import type { CV } from '$lib/types/cv';

export function hasUpdatesAvailable(master: CV, tailored: CV): boolean {
	const synced = tailored.syncDecisions?.sourceSyncedVersion ?? 0;
	return master.version > synced;
}
