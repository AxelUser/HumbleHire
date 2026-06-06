import type { CV, CVContent } from '$lib/types/cv';
import { computeHashes } from '$lib/features/tailoring/hash';
import { emptyContent } from '$lib/services/cv/create';

function mkContent(name = '', position = '', location = ''): CVContent {
	const content = emptyContent();
	content.basics.fullName = name;
	content.basics.position = position;
	content.basics.location = location;
	return content;
}

const now = Date.now();

const masterContent = mkContent('Aleksey Maltsev', 'Software Engineer', 'San Francisco, CA');
const masterHashes = computeHashes(masterContent);

export const masterCv: CV = {
	id: 'master-1',
	name: 'Software Engineer',
	createdAt: now - 86400000 * 14,
	updatedAt: now - 86400000 * 4,
	content: masterContent,
	hashes: masterHashes,
	hidden: []
};

const syncedTailoredContent = mkContent(
	'Aleksey Maltsev',
	'Senior Frontend Engineer',
	'San Francisco, CA'
);
export const syncedTailored: CV = {
	id: 'tailored-1',
	name: 'Senior Frontend Engineer',
	company: 'Stripe',
	createdAt: now - 86400000 * 5,
	updatedAt: now,
	content: syncedTailoredContent,
	hashes: computeHashes(syncedTailoredContent),
	hidden: [],
	sourceId: 'master-1',
	baseline: masterContent,
	baselineHashes: masterHashes
};

const staleTailoredContent = mkContent('Aleksey Maltsev', 'SWE L5', 'Mountain View, CA');
const staleBaselineContent = mkContent('Aleksey Maltsev', 'Older Title', 'Mountain View, CA');
const staleBaselineHashes = computeHashes(staleBaselineContent);
export const staleTailored: CV = {
	id: 'tailored-2',
	name: 'SWE L5',
	company: 'Google',
	createdAt: now - 86400000 * 9,
	updatedAt: now - 86400000 * 9,
	content: staleTailoredContent,
	hashes: computeHashes(staleTailoredContent),
	hidden: [],
	sourceId: 'master-1',
	baseline: staleBaselineContent,
	baselineHashes: staleBaselineHashes
};

const masterCv2Content = mkContent('Aleksey Maltsev', 'Product Manager', 'New York, NY');
export const masterCv2: CV = {
	id: 'master-2',
	name: 'Product Manager',
	createdAt: now - 86400000 * 30,
	updatedAt: now - 86400000 * 7,
	content: masterCv2Content,
	hashes: computeHashes(masterCv2Content),
	hidden: []
};
