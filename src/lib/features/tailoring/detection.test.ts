import { describe, expect, it } from 'vitest';
import type { ObjectId } from '$lib/types/cv';
import { hasUpdatesAvailable } from './detection';
import { diffCVs } from './diff';
import { applySyncDecisions } from './apply';
import { computeBlockHashes } from './hash';
import { listBlock, makeAchievement, makeJob, makeMaster, makeTailored } from './_fixtures';

function refreshMasterHashes(master: {
	blocks: Parameters<typeof computeBlockHashes>[0];
	blockHashes: ReturnType<typeof computeBlockHashes>;
}) {
	master.blockHashes = computeBlockHashes(master.blocks);
}

describe('hasUpdatesAvailable', () => {
	it('fresh tailored CV has no updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('master text edit triggers updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.position.value = 'Staff Engineer';
		refreshMasterHashes(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);
	});

	it('master nested edit triggers updates', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);
		master.blocks.jobHistory.value[0].achievements.push(makeAchievement('New'));
		refreshMasterHashes(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);
	});

	it('tailored-only edit does NOT trigger updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.blocks.position.value = 'My Custom Position';
		tailored.blockHashes = computeBlockHashes(tailored.blocks);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('master change to hidden-on-master block does NOT trigger updates', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		master.hiddenBlockIds = [master.blocks.jobHistory.objectId];
		const tailored = makeTailored(master);
		master.blocks.jobHistory.value[0].role = 'Staff Engineer';
		refreshMasterHashes(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('master change to hidden-on-tailored block does NOT trigger updates', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);
		tailored.hiddenBlockIds = [master.blocks.jobHistory.objectId];
		master.blocks.jobHistory.value[0].role = 'Staff Engineer';
		refreshMasterHashes(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('unhiding the block on tailored re-introduces updates', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);
		tailored.hiddenBlockIds = [master.blocks.jobHistory.objectId];
		master.blocks.jobHistory.value[0].role = 'Staff Engineer';
		refreshMasterHashes(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);

		tailored.hiddenBlockIds = [];
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);
	});

	it('master toggling visibility alone is not a content change', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);
		master.hiddenBlockIds = [master.blocks.jobHistory.objectId];
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
		master.hiddenBlockIds = [];
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('after Apply with all discards, indicator turns off', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.position.value = 'Staff Engineer';
		refreshMasterHashes(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);

		const items = diffCVs(master, tailored);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>(
			items.map((i) => [i.objectId, 'discarded'] as const)
		);
		applySyncDecisions(tailored, master, decisions);

		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('after Apply with all accepts, indicator turns off', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.position.value = 'Staff Engineer';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>(
			items.map((i) => [i.objectId, 'accepted'] as const)
		);
		applySyncDecisions(tailored, master, decisions);

		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('a CV without syncBaselineHashes (e.g. orphaned) has no updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.syncBaselineHashes = undefined;
		master.blocks.position.value = 'Anything';
		refreshMasterHashes(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('indicator is on iff diffCVs returns ≥1 item (strict equivalence) — multiple scenarios', () => {
		const scenarios = [
			(m: ReturnType<typeof makeMaster>) => {
				m.blocks.fullName.value = 'Different Name';
			},
			(m: ReturnType<typeof makeMaster>) => {
				m.blocks.highlights.value.push(makeAchievement('x') as never);
			},
			(m: ReturnType<typeof makeMaster>) => {
				m.blocks.location.value = 'Berlin';
			}
		];
		for (const mutate of scenarios) {
			const master = makeMaster();
			const tailored = makeTailored(master);
			mutate(master);
			refreshMasterHashes(master);
			expect(hasUpdatesAvailable(master, tailored)).toBe(diffCVs(master, tailored).length > 0);
		}
	});
});
