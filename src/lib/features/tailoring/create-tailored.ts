import { db } from '$lib/db/index';
import type { CV } from '$lib/types/cv';

export async function createTailoredCV(
	master: CV,
	name: string,
	notes: string
): Promise<string> {
	const id = crypto.randomUUID();
	const now = Date.now();

	const tailored: CV = {
		id,
		name,
		notes,
		createdAt: now,
		updatedAt: now,
		version: 1,
		blocks: structuredClone(master.blocks),
		hiddenBlockIds: [...master.hiddenBlockIds],
		sourceId: master.id,
		syncDecisions: {
			sourceSyncedVersion: master.version,
			discarded: {}
		}
	};

	await db.cvs.add(tailored);
	return id;
}
