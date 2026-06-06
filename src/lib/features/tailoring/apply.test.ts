import { describe, expect, it } from 'vitest';
import { applySyncDecisions } from './apply';
import { diffCVs } from './diff';
import { computeHashes } from './hash';
import { encodePath } from './paths';
import { makeMaster, makeTailored, makeWork } from './_fixtures';
import type { DiffItem } from './types';

type Decision = 'accepted' | 'discarded';

function decide(items: DiffItem[], decision: Decision): Map<string, Decision> {
	return new Map(items.map((i) => [encodePath(i.path), decision]));
}

describe('applySyncDecisions - modified scalar', () => {
	it('accept updates the tailored value and clears the diff', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.fullName = 'Jane Smith';
		applySyncDecisions(tailored, master, decide(diffCVs(master, tailored), 'accepted'));
		expect(tailored.content.basics.fullName).toBe('Jane Smith');
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('discard keeps the tailored value but advances the baseline so it does not re-prompt', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.fullName = 'Jane Smith';
		applySyncDecisions(tailored, master, decide(diffCVs(master, tailored), 'discarded'));
		expect(tailored.content.basics.fullName).toBe('John Doe');
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('re-surfaces a discarded field when the master changes it again', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.fullName = 'Jane Smith';
		applySyncDecisions(tailored, master, decide(diffCVs(master, tailored), 'discarded'));
		master.content.basics.fullName = 'Jane Jones';
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(encodePath(items[0].path)).toBe('basics/fullName/');
	});
});

describe('applySyncDecisions - added entry', () => {
	it('accept adds the entry to the tailored copy', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const job = makeWork('Acme', 'Eng');
		master.content.work.push(job);
		applySyncDecisions(tailored, master, decide(diffCVs(master, tailored), 'accepted'));
		expect(tailored.content.work.map((w) => w.name)).toContain('Acme');
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('discard does not add it to the tailored copy but stops re-prompting', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.work.push(makeWork('Acme', 'Eng'));
		applySyncDecisions(tailored, master, decide(diffCVs(master, tailored), 'discarded'));
		expect(tailored.content.work).toHaveLength(0);
		expect(diffCVs(master, tailored)).toEqual([]);
	});
});

describe('applySyncDecisions - removed entry', () => {
	it('accept removes the entry from the tailored copy', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work = [];
		applySyncDecisions(tailored, master, decide(diffCVs(master, tailored), 'accepted'));
		expect(tailored.content.work).toHaveLength(0);
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('discard keeps the entry in the tailored copy but stops re-prompting', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work = [];
		applySyncDecisions(tailored, master, decide(diffCVs(master, tailored), 'discarded'));
		expect(tailored.content.work).toHaveLength(1);
		expect(diffCVs(master, tailored)).toEqual([]);
	});
});

describe('applySyncDecisions - partial resolution', () => {
	it('leaves the baseline untouched for an unresolved item', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work[0].position = 'Lead'; // resolved
		master.content.work[0].name = 'Acme Corp'; // left unresolved
		const items = diffCVs(master, tailored);
		const decisions = new Map(
			items
				.filter((i) => encodePath(i.path).endsWith('position/'))
				.map((i) => [encodePath(i.path), 'accepted' as const])
		);
		applySyncDecisions(tailored, master, decisions);
		const remaining = diffCVs(master, tailored);
		expect(remaining).toHaveLength(1);
		expect(encodePath(remaining[0].path)).toBe(`work/${job.objectId}/name/`);
	});
});

describe('applySyncDecisions - hidden section', () => {
	it('does not advance a hidden section baseline, so changes surface on unhide', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master, { hidden: ['work/'] });
		master.content.work[0].position = 'Lead';
		master.hashes = computeHashes(master.content);

		// Hidden: nothing to resolve, baseline must not advance.
		applySyncDecisions(tailored, master, new Map());
		expect(diffCVs(master, tailored)).toEqual([]); // still hidden, no items

		// Unhide: the master change appears.
		tailored.hidden = [];
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(encodePath(items[0].path)).toBe(`work/${job.objectId}/position/`);
	});
});
