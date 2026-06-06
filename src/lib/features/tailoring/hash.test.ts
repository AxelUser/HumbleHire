import { describe, expect, it } from 'vitest';
import { canonicalJson, computeHashes, hashSection, SECTION_KEYS } from './hash';
import { completeContent, emptyContent, str } from './_fixtures';

describe('canonicalJson', () => {
	it('sorts keys alphabetically regardless of insertion order', () => {
		const a = canonicalJson({ company: 'Acme', role: 'Eng' });
		const b = canonicalJson({ role: 'Eng', company: 'Acme' });
		expect(a).toBe(b);
	});

	it('serialises Date as ISO string', () => {
		const d = new Date('2024-01-15T10:00:00.000Z');
		expect(canonicalJson(d)).toBe('"2024-01-15T10:00:00.000Z"');
	});

	it('omits undefined leaves', () => {
		expect(canonicalJson(undefined)).toBe('null');
	});

	it('handles nested objects with stable order', () => {
		const a = canonicalJson({ a: { z: 1, y: 2 }, b: 3 });
		const b = canonicalJson({ b: 3, a: { y: 2, z: 1 } });
		expect(a).toBe(b);
	});

	it('preserves array order (arrays are not sorted)', () => {
		const a = canonicalJson([1, 2, 3]);
		const b = canonicalJson([3, 2, 1]);
		expect(a).not.toBe(b);
	});

	it('handles strings, numbers, booleans, null', () => {
		expect(canonicalJson('hello')).toBe('"hello"');
		expect(canonicalJson(42)).toBe('42');
		expect(canonicalJson(true)).toBe('true');
		expect(canonicalJson(null)).toBe('null');
	});

	it('handles arrays of objects with mixed key orders', () => {
		const a = canonicalJson([
			{ x: 1, y: 2 },
			{ y: 4, x: 3 }
		]);
		const b = canonicalJson([
			{ y: 2, x: 1 },
			{ x: 3, y: 4 }
		]);
		expect(a).toBe(b);
	});
});

describe('hashSection', () => {
	it('same content, different key order → same hash', () => {
		expect(hashSection({ company: 'Acme', role: 'Eng' })).toBe(
			hashSection({ role: 'Eng', company: 'Acme' })
		);
	});

	it('different content → different hash', () => {
		expect(hashSection({ role: 'Eng' })).not.toBe(hashSection({ role: 'Sr Eng' }));
	});

	it('Date round-trip is stable', () => {
		const d1 = new Date('2024-06-01T00:00:00.000Z');
		const d2 = new Date('2024-06-01T00:00:00.000Z');
		expect(hashSection({ when: d1 })).toBe(hashSection({ when: d2 }));
	});
});

describe('computeHashes', () => {
	it('produces a hash for every section', () => {
		const hashes = computeHashes(completeContent());
		for (const key of SECTION_KEYS) {
			expect(hashes[key]).toMatch(/^[0-9a-f]+$/);
		}
	});

	it('is deterministic for the same content', () => {
		const content = completeContent();
		expect(computeHashes(content)).toEqual(computeHashes(content));
	});

	it('changes only the section whose content changed', () => {
		const before = computeHashes(emptyContent());
		const after = computeHashes(
			emptyContent({ skills: [{ objectId: '1' as never, name: 'X', keywords: [str('Go')] }] })
		);
		expect(after.skills).not.toBe(before.skills);
		expect(after.work).toBe(before.work);
		expect(after.basics).toBe(before.basics);
	});
});
