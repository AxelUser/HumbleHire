import { createObjectId } from '$lib/types/cv';
import type { CV, CVBlocks } from '$lib/types/cv';
import { computeBlockHashes } from '$lib/features/tailoring/hash';
import { CLASSIC_TEMPLATE } from './templates';
import type { CVTemplate } from './templates';

export function createCVFromTemplate(
	id: string,
	name: string,
	template: CVTemplate = CLASSIC_TEMPLATE
): CV {
	void template;
	const now = Date.now();

	const blocks: CVBlocks = {
		fullName: { objectId: createObjectId(), value: '' },
		position: { objectId: createObjectId(), value: '' },
		location: { objectId: createObjectId(), value: '' },
		contacts: { objectId: createObjectId(), value: [] },
		highlights: { objectId: createObjectId(), value: [] },
		skills: { objectId: createObjectId(), value: [] },
		jobHistory: { objectId: createObjectId(), value: [] },
		projects: { objectId: createObjectId(), value: [] },
		education: { objectId: createObjectId(), value: [] }
	};

	return {
		id,
		name,
		createdAt: now,
		updatedAt: now,
		blocks,
		blockHashes: computeBlockHashes(blocks),
		hiddenBlockIds: []
	};
}
