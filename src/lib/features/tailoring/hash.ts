import xxhash from 'xxhash-wasm';
import type { CVContent, SectionHashes, SectionKey } from '$lib/types/cv';

const { h64ToString } = await xxhash();

export const SECTION_KEYS: readonly SectionKey[] = [
	'basics',
	'work',
	'volunteer',
	'education',
	'awards',
	'certificates',
	'publications',
	'skills',
	'languages',
	'interests',
	'references',
	'projects'
] as const;

/**
 * Serialize a value to JSON with object keys sorted, so two values that differ only in key order
 * hash the same. Arrays keep their order (it's meaningful), and Dates serialize as their ISO string.
 */
export function canonicalJson(value: unknown): string {
	if (value === null || value === undefined) return 'null';
	if (value instanceof Date) return JSON.stringify(value.toISOString());
	if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
	if (typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		const keys = Object.keys(obj).sort();
		return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
	}
	return JSON.stringify(value);
}

/** Hash one section's value through its canonical JSON, so the hash ignores object key order. */
export function hashSection(value: unknown): string {
	return h64ToString(canonicalJson(value));
}

/**
 * Hash every section of the content, ids included. This stays deliberately blind to hide-state: it
 * hashes all of a section whether or not parts are hidden, which keeps updates-available detection a
 * cheap per-section comparison. Reconciling per-field hiding is detection's job, not the hasher's.
 */
export function computeHashes(content: CVContent): SectionHashes {
	const out = {} as SectionHashes;
	for (const key of SECTION_KEYS) {
		out[key] = hashSection(content[key]);
	}
	return out;
}
