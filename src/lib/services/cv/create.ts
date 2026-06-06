import { createId } from '$lib/id.js';
import type { CV, CVContent } from '$lib/types/cv';
import { computeHashes } from '$lib/features/tailoring/hash';

export interface CreateCVOptions {
	name: string;
	id?: string;
}

/** An empty content shell: blank basics and an empty array for every section. */
export function emptyContent(): CVContent {
	return {
		basics: {
			fullName: '',
			position: '',
			location: '',
			summary: '',
			highlights: [],
			email: '',
			phone: '',
			url: '',
			profiles: []
		},
		work: [],
		volunteer: [],
		education: [],
		awards: [],
		certificates: [],
		publications: [],
		skills: [],
		languages: [],
		interests: [],
		references: [],
		projects: []
	};
}

export function createCV({ name, id = createId() }: CreateCVOptions): CV {
	const now = Date.now();
	const content = emptyContent();

	return {
		id,
		name,
		createdAt: now,
		updatedAt: now,
		content,
		hashes: computeHashes(content),
		hidden: []
	};
}
