import { describe, expect, it } from 'vitest';
import { makeMaster, makeTailored } from './_fixtures';
import { orphanTailored } from './orphan';

describe('orphanTailored', () => {
	it('clears sourceId, baseline, baselineHashes', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const orphaned = orphanTailored(tailored);

		expect(orphaned.sourceId).toBeUndefined();
		expect(orphaned.baseline).toBeUndefined();
		expect(orphaned.baselineHashes).toBeUndefined();
	});

	it('preserves content, hashes, name, hidden', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const orphaned = orphanTailored(tailored);

		expect(orphaned.content).toEqual(tailored.content);
		expect(orphaned.hashes).toEqual(tailored.hashes);
		expect(orphaned.name).toBe(tailored.name);
		expect(orphaned.hidden).toEqual(tailored.hidden);
	});

	it('returns a new object, does not mutate input', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const orphaned = orphanTailored(tailored);

		expect(orphaned).not.toBe(tailored);
		expect(tailored.sourceId).toBe(master.id);
		expect(tailored.baseline).toBeDefined();
	});
});
