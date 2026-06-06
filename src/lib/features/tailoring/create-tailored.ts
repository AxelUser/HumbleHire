import { db } from '$lib/db/index';
import type { CV } from '$lib/types/cv';
import { createId } from '$lib/id.js';

export async function createTailoredCV(
	master: CV,
	name: string,
	company?: string
): Promise<string> {
	const id = createId();
	const now = Date.now();

	const tailored: CV = {
		id,
		name,
		company: company || undefined,
		createdAt: now,
		updatedAt: now,
		content: structuredClone(master.content),
		hashes: { ...master.hashes },
		hidden: [...master.hidden],
		sourceId: master.id,
		baseline: structuredClone(master.content),
		baselineHashes: { ...master.hashes }
	};

	await db.cvs.add(tailored);
	return id;
}
