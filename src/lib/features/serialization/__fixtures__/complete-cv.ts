import type { CV } from '$lib/types/cv';
import { computeHashes } from '$lib/features/tailoring/hash';
import { completeContent } from '$lib/features/tailoring/_fixtures';

/** A CV with every section populated and every field set, for round-trip and interop coverage. */
export function makeCompleteCV(overrides: Partial<CV> = {}): CV {
	const content = overrides.content ?? completeContent();
	return {
		id: 'test-id',
		name: 'Jane Doe',
		createdAt: 0,
		updatedAt: 0,
		hidden: [],
		...overrides,
		content,
		hashes: computeHashes(content)
	};
}
