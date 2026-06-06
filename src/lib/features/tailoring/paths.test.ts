import { describe, expect, it } from 'vitest';
import type { ObjectId } from '$lib/types/cv';
import { encodePath, isPathHidden, type Path } from './paths';

const oid = (s: string) => s as ObjectId;

describe('encodePath', () => {
	it('encodes a single section as a terminated segment', () => {
		expect(encodePath([{ field: 'work' }])).toBe('work/');
	});

	it('encodes a nested field path', () => {
		expect(encodePath([{ field: 'basics' }, { field: 'location' }])).toBe('basics/location/');
	});

	it('encodes an entry id segment', () => {
		const path: Path = [{ field: 'work' }, { id: oid('job-1') }];
		expect(encodePath(path)).toBe('work/job-1/');
	});
});

describe('isPathHidden', () => {
	it('hides a path whose own section is in the set', () => {
		const hidden = new Set(['work/']);
		expect(isPathHidden(hidden, [{ field: 'work' }])).toBe(true);
	});

	it('hides a descendant when an ancestor section is hidden', () => {
		const hidden = new Set(['work/']);
		const entry: Path = [{ field: 'work' }, { id: oid('job-1') }, { field: 'position' }];
		expect(isPathHidden(hidden, entry)).toBe(true);
	});

	it('does not false-match a sibling section sharing a prefix', () => {
		const hidden = new Set(['work/']);
		expect(isPathHidden(hidden, [{ field: 'workshops' }])).toBe(false);
	});

	it('returns false for an unrelated path', () => {
		const hidden = new Set(['work/']);
		expect(isPathHidden(hidden, [{ field: 'education' }])).toBe(false);
	});
});
