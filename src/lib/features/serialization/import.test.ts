import { describe, expect, it, vi, beforeEach } from 'vitest';
import { APP_BASE_URL } from '$lib/config';

vi.mock('$lib/db/index', () => ({
	db: { cvs: { add: vi.fn() } }
}));

import { db } from '$lib/db/index';
import { importDocument } from './import';

const VALID = JSON.stringify({
	$schema: `${APP_BASE_URL}/schema/resume/v0.0.1.json`,
	basics: { name: 'Jane Doe' },
	meta: { humblehire: { schemaVersion: '0.0.1' } }
});

describe('importDocument', () => {
	beforeEach(() => {
		vi.mocked(db.cvs.add).mockReset();
	});

	it('returns persistence error when db.cvs.add throws', async () => {
		vi.mocked(db.cvs.add).mockRejectedValue(new Error('QuotaExceededError'));
		const result = await importDocument(VALID);
		expect(result.ok).toBe(false);
		if (!result.ok && result.error.kind === 'persistence') {
			expect(result.error.message).toBe('QuotaExceededError');
		} else {
			expect.fail('expected persistence error');
		}
	});

	it('returns success when db.cvs.add succeeds', async () => {
		vi.mocked(db.cvs.add).mockResolvedValue(undefined);
		const result = await importDocument(VALID);
		expect(result.ok).toBe(true);
	});
});
