import { describe, expect, it } from 'vitest';
import { makeMaster, makeTailored } from './_fixtures';
import { orphanTailored } from './orphan';

describe('orphanTailored', () => {
	it('clears sourceId, syncBaseline, syncBaselineHashes', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const orphaned = orphanTailored(tailored);

		expect(orphaned.sourceId).toBeUndefined();
		expect(orphaned.syncBaseline).toBeUndefined();
		expect(orphaned.syncBaselineHashes).toBeUndefined();
	});

	it('preserves blocks, blockHashes, name, hiddenBlockIds', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const orphaned = orphanTailored(tailored);

		expect(orphaned.blocks).toEqual(tailored.blocks);
		expect(orphaned.blockHashes).toEqual(tailored.blockHashes);
		expect(orphaned.name).toBe(tailored.name);
		expect(orphaned.hiddenBlockIds).toEqual(tailored.hiddenBlockIds);
	});

	it('returns a new object, does not mutate input', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const orphaned = orphanTailored(tailored);

		expect(orphaned).not.toBe(tailored);
		expect(tailored.sourceId).toBe(master.id);
		expect(tailored.syncBaseline).toBeDefined();
	});
});
