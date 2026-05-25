import { db } from '$lib/db/index';
import type { CV } from '$lib/types/cv';

export async function createTailoredCV(
	master: CV,
	name: string,
	company?: string
): Promise<string> {
	const id = crypto.randomUUID();
	const now = Date.now();

	const tailored: CV = {
		id,
		name,
		company: company || undefined,
		createdAt: now,
		updatedAt: now,
		version: 1,
		blocks: structuredClone(master.blocks),
		hiddenBlockIds: [...master.hiddenBlockIds],
		sourceId: master.id,
		syncBaseline: structuredClone(master.blocks),
		syncDecisions: {
			sourceSyncedVersion: master.version,
			discarded: {}
		}
	};

	await db.cvs.add(tailored);
	return id;
}
