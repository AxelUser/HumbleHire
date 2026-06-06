import { describe, expect, it } from 'vitest';
import { buildDocDef, sanitizeFilename } from './generate';
import { makeMaster, makeWork } from '$lib/features/tailoring/_fixtures';

describe('buildDocDef', () => {
	it('returns a document with the expected top-level keys', () => {
		const doc = buildDocDef(makeMaster());
		expect(doc).toHaveProperty('content');
		expect(doc).toHaveProperty('pageSize', 'A4');
		expect(doc).toHaveProperty('pageMargins');
		expect(doc).toHaveProperty('defaultStyle');
	});

	it('uses the classic theme by default', () => {
		expect(buildDocDef(makeMaster()).defaultStyle!.font).toBe('Roboto');
	});

	it('falls back to the default theme for an unknown theme key', () => {
		expect(buildDocDef(makeMaster(), 'nonexistent').defaultStyle!.font).toBe('Roboto');
	});

	it('strips hidden content before passing it to the theme', () => {
		const cv = makeMaster({ work: [makeWork('Acme', 'Eng')] }, { hidden: ['basics/fullName/'] });
		const doc = buildDocDef(cv);
		expect(JSON.stringify(doc.content)).not.toContain('John Doe');
	});
});

describe('sanitizeFilename', () => {
	it('removes characters illegal in filenames', () => {
		expect(sanitizeFilename('foo/bar:baz')).toBe('foobarbaz');
	});

	it('keeps valid characters', () => {
		expect(sanitizeFilename('My CV 2026')).toBe('My CV 2026');
	});

	it('falls back to "cv" when the result would be empty', () => {
		expect(sanitizeFilename('///:*?')).toBe('cv');
	});

	it('trims surrounding whitespace', () => {
		expect(sanitizeFilename('  Jane  ')).toBe('Jane');
	});
});
