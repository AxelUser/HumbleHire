import { createObjectId } from '$lib/types/cv';
import type { CV } from '$lib/types/cv';
import { CLASSIC_TEMPLATE } from './templates';
import type { CVTemplate } from './templates';

export function createCVFromTemplate(
	id: string,
	name: string,
	template: CVTemplate = CLASSIC_TEMPLATE
): CV {
	void template;
	const now = Date.now();

	return {
		id,
		name,
		createdAt: now,
		updatedAt: now,
		version: 1,
		blocks: {
			fullName: { objectId: createObjectId(), value: '' },
			position: { objectId: createObjectId(), value: '' },
			location: { objectId: createObjectId(), value: '' },
			contacts: { objectId: createObjectId(), value: [] },
			highlights: { objectId: createObjectId(), value: [] },
			skills: { objectId: createObjectId(), value: [] },
			jobHistory: { objectId: createObjectId(), value: [] },
			projects: { objectId: createObjectId(), value: [] },
			education: { objectId: createObjectId(), value: [] }
		},
		hiddenBlockIds: []
	};
}
