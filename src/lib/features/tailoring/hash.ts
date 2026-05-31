import xxhash from 'xxhash-wasm';
import type { BlockHashes, CVBlocks, CVBlockKey } from '$lib/types/cv';

const { h64ToString } = await xxhash();

const BLOCK_KEYS: readonly CVBlockKey[] = [
	'fullName',
	'position',
	'location',
	'contacts',
	'highlights',
	'skills',
	'jobHistory',
	'projects',
	'education'
] as const;

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

export function hashBlock(value: unknown): string {
	return h64ToString(canonicalJson(value));
}

export function computeBlockHashes(blocks: CVBlocks): BlockHashes {
	const out = {} as BlockHashes;
	for (const key of BLOCK_KEYS) {
		out[key] = hashBlock(blocks[key].value);
	}
	return out;
}
