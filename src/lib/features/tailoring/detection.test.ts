import { describe, expect, it } from 'vitest';
import { hasUpdatesAvailable } from './detection';
import { diffCVs } from './diff';
import { applySyncDecisions } from './apply';
import { computeHashes } from './hash';
import { encodePath } from './paths';
import { makeMaster, makeTailored, makeWork, str } from './_fixtures';

function refreshMaster(master: ReturnType<typeof makeMaster>) {
	master.hashes = computeHashes(master.content);
}

describe('hasUpdatesAvailable', () => {
	it('fresh tailored CV has no updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('master scalar edit triggers updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.position = 'Staff Engineer';
		refreshMaster(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);
	});

	it('master nested edit triggers updates', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work[0].highlights.push(str('New'));
		refreshMaster(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);
	});

	it('tailored-only edit does NOT trigger updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.content.basics.position = 'My Custom Position';
		tailored.hashes = computeHashes(tailored.content);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('master change to a section hidden on master does NOT trigger updates', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] }, { hidden: ['work/'] });
		const tailored = makeTailored(master);
		master.content.work[0].position = 'Staff Engineer';
		refreshMaster(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('master change to a section hidden on tailored does NOT trigger updates, but unhide does', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master, { hidden: ['work/'] });
		master.content.work[0].position = 'Staff Engineer';
		refreshMaster(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);

		tailored.hidden = [];
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);
	});

	it('turns off after applying all discards', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.position = 'Staff Engineer';
		refreshMaster(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(true);

		const items = diffCVs(master, tailored);
		applySyncDecisions(
			tailored,
			master,
			new Map(items.map((i) => [encodePath(i.path), 'discarded' as const]))
		);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('turns off after applying all accepts', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.position = 'Staff Engineer';
		refreshMaster(master);

		const items = diffCVs(master, tailored);
		applySyncDecisions(
			tailored,
			master,
			new Map(items.map((i) => [encodePath(i.path), 'accepted' as const]))
		);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('a CV without baselineHashes (e.g. orphaned) has no updates', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.baselineHashes = undefined;
		master.content.basics.position = 'Anything';
		refreshMaster(master);
		expect(hasUpdatesAvailable(master, tailored)).toBe(false);
	});

	it('documented wart: a sole change in a hidden basics field lights the badge with an empty drawer', () => {
		// Field-level hiding is per-field; the badge is per-section. This false positive is accepted.
		const master = makeMaster();
		const tailored = makeTailored(master, { hidden: ['basics/location/'] });
		master.content.basics.location = 'Berlin';
		refreshMaster(master);
		expect(diffCVs(master, tailored)).toEqual([]); // drawer is empty (field hidden)
		expect(hasUpdatesAvailable(master, tailored)).toBe(true); // badge still lights
	});
});
