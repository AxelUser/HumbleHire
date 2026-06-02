import { db } from '$lib/db/index';
import type { CV } from '$lib/types/cv';
import { randomUUID } from '$lib/utils.js';

export async function createTailoredCV(
	master: CV,
	name: string,
	company?: string
): Promise<string> {
	const id = randomUUID();
	const now = Date.now();

	const tailored: CV = {
		id,
		name,
		company: company || undefined,
		createdAt: now,
		updatedAt: now,
		blocks: structuredClone(master.blocks),
		blockHashes: { ...master.blockHashes },
		hiddenBlockIds: [...master.hiddenBlockIds],
		sourceId: master.id,
		syncBaseline: structuredClone(master.blocks),
		syncBaselineHashes: { ...master.blockHashes }
	};

	await db.cvs.add(tailored);
	return id;
}
