import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { CV } from '$lib/types/cv';
import { buildDocDef, sanitizeFilename } from './generate';

function makeCV(overrides: Partial<CV> = {}): CV {
	const id = createObjectId();
	return {
		id: 'test-id',
		name: 'Jane Doe',
		createdAt: 0,
		updatedAt: 0,
		version: 1,
		hiddenBlockIds: [],
		blocks: {
			fullName: { objectId: id, value: 'Jane Doe' },
			position: { objectId: createObjectId(), value: 'Engineer' },
			location: { objectId: createObjectId(), value: 'London' },
			contacts: { objectId: createObjectId(), value: [] },
			highlights: { objectId: createObjectId(), value: [] },
			skills: { objectId: createObjectId(), value: [] },
			jobHistory: { objectId: createObjectId(), value: [] },
			projects: { objectId: createObjectId(), value: [] },
			education: { objectId: createObjectId(), value: [] }
		},
		...overrides
	};
}

describe('buildDocDef', () => {
	it('returns a document with expected top-level keys', () => {
		const doc = buildDocDef(makeCV());
		expect(doc).toHaveProperty('content');
		expect(doc).toHaveProperty('pageSize', 'A4');
		expect(doc).toHaveProperty('pageMargins');
		expect(doc).toHaveProperty('defaultStyle');
	});

	it('uses the classic theme by default', () => {
		const doc = buildDocDef(makeCV());
		expect(doc.defaultStyle!.font).toBe('Roboto');
	});

	it('falls back to the default theme for an unknown theme key', () => {
		const doc = buildDocDef(makeCV(), 'nonexistent');
		expect(doc.defaultStyle!.font).toBe('Roboto');
	});

	it('strips hidden blocks before passing to the theme', () => {
		const cv = makeCV();
		const fullNameId = cv.blocks.fullName.objectId;
		cv.hiddenBlockIds = [fullNameId];
		const doc = buildDocDef(cv);
		expect(JSON.stringify(doc.content)).not.toContain('Jane Doe');
	});
});

describe('sanitizeFilename', () => {
	it('removes characters illegal in filenames', () => {
		expect(sanitizeFilename('foo/bar:baz')).toBe('foobarbaz');
	});

	it('strips illegal characters and keeps valid ones', () => {
		expect(sanitizeFilename('My CV 2026')).toBe('My CV 2026');
	});

	it('falls back to "cv" when the result would be empty', () => {
		expect(sanitizeFilename('///:*?')).toBe('cv');
	});

	it('trims surrounding whitespace', () => {
		expect(sanitizeFilename('  Jane  ')).toBe('Jane');
	});
});
