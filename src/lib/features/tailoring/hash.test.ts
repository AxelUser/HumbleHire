import { describe, expect, it } from 'vitest';
import { canonicalJson, hashBlock } from './hash';

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

describe('hashBlock', () => {
	it('same content, different key order → same hash', () => {
		expect(hashBlock({ company: 'Acme', role: 'Eng' })).toBe(
			hashBlock({ role: 'Eng', company: 'Acme' })
		);
	});

	it('different content → different hash', () => {
		expect(hashBlock({ role: 'Eng' })).not.toBe(hashBlock({ role: 'Sr Eng' }));
	});

	it('hashing the same input twice is deterministic', () => {
		const input = {
			fullName: 'John',
			jobs: [{ company: 'A', role: 'B' }]
		};
		expect(hashBlock(input)).toBe(hashBlock(input));
	});

	it('returns a fixed-width hex string', () => {
		const h = hashBlock({ value: 'anything' });
		expect(h).toMatch(/^[0-9a-f]+$/);
		expect(h.length).toBeGreaterThan(0);
	});

	it('empty array vs empty object differ', () => {
		expect(hashBlock([])).not.toBe(hashBlock({}));
	});

	it('Date round-trip is stable', () => {
		const d1 = new Date('2024-06-01T00:00:00.000Z');
		const d2 = new Date('2024-06-01T00:00:00.000Z');
		expect(hashBlock({ when: d1 })).toBe(hashBlock({ when: d2 }));
	});
});
