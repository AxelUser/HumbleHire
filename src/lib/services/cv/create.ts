import { createId } from '$lib/id.js';
import { createObjectId, type CV, type CVBlocks } from '$lib/types/cv';
import { computeBlockHashes } from '$lib/features/tailoring/hash';

export interface CreateCVOptions {
	name: string;
	id?: string;
}

export function createCV({ name, id = createId() }: CreateCVOptions): CV {
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
