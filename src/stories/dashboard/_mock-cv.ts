import type { CV, CVBlocks, ObjectId } from '$lib/types/cv';

function id(slug: string): ObjectId {
	return slug as ObjectId;
}

export function mkBlocks(name = '', position = '', location = ''): CVBlocks {
	return {
		fullName: { objectId: id(`${name}-fn`), value: name },
		position: { objectId: id(`${name}-pos`), value: position },
		location: { objectId: id(`${name}-loc`), value: location },
		contacts: { objectId: id(`${name}-cb`), value: [] },
		highlights: { objectId: id(`${name}-hb`), value: [] },
		skills: { objectId: id(`${name}-sb`), value: [] },
		jobHistory: { objectId: id(`${name}-jb`), value: [] },
		projects: { objectId: id(`${name}-pb`), value: [] },
		education: { objectId: id(`${name}-eb`), value: [] }
	};
}

const now = Date.now();

export const masterCv: CV = {
	id: 'master-1',
	name: 'Software Engineer',
	version: 5,
	createdAt: now - 86400000 * 14,
	updatedAt: now - 86400000 * 4,
	blocks: mkBlocks('Aleksey Maltsev', 'Software Engineer', 'San Francisco, CA'),
	hiddenBlockIds: []
};

export const syncedTailored: CV = {
	id: 'tailored-1',
	name: 'Senior Frontend Engineer',
	company: 'Stripe',
	version: 2,
	createdAt: now - 86400000 * 5,
	updatedAt: now,
	blocks: mkBlocks('Aleksey Maltsev', 'Senior Frontend Engineer', 'San Francisco, CA'),
	hiddenBlockIds: [],
	sourceId: 'master-1',
	syncDecisions: { sourceSyncedVersion: 5, discarded: {} }
};

export const staleTailored: CV = {
	id: 'tailored-2',
	name: 'SWE L5',
	company: 'Google',
	version: 1,
	createdAt: now - 86400000 * 9,
	updatedAt: now - 86400000 * 9,
	blocks: mkBlocks('Aleksey Maltsev', 'SWE L5', 'Mountain View, CA'),
	hiddenBlockIds: [],
	sourceId: 'master-1',
	syncDecisions: { sourceSyncedVersion: 3, discarded: {} }
};

export const masterCv2: CV = {
	id: 'master-2',
	name: 'Product Manager',
	version: 2,
	createdAt: now - 86400000 * 30,
	updatedAt: now - 86400000 * 7,
	blocks: mkBlocks('Aleksey Maltsev', 'Product Manager', 'New York, NY'),
	hiddenBlockIds: []
};
