import { describe, expect, it } from 'vitest';
import { diffCVs } from './diff';
import { encodePath } from './paths';
import { makeMaster, makeTailored, makeWork, str } from './_fixtures';

describe('diffCVs - basics scalars', () => {
	it('no changes, no diff', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('tailored-only scalar change is ignored', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.content.basics.fullName = 'Jane Smith';
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('master scalar change becomes a modified item at the field path', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.fullName = 'Jane Smith';
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].change).toBe('modified');
		expect(encodePath(items[0].path)).toBe('basics/fullName/');
	});

	it('converging changes to the same value produce no diff', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.position = 'Same';
		tailored.content.basics.position = 'Same';
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('before is the tailored value, after is the master value', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.position = 'Master Position';
		tailored.content.basics.position = 'Tailored Position';
		const item = diffCVs(master, tailored)[0];
		expect(item.change === 'modified' && item.before).toBe('Tailored Position');
		expect(item.change === 'modified' && item.after).toBe('Master Position');
	});
});

describe('diffCVs - list entries', () => {
	it('master-added entry is a single added item', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const job = makeWork('Acme', 'Eng');
		master.content.work.push(job);
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].change).toBe('added');
		expect(encodePath(items[0].path)).toBe(`work/${job.objectId}/`);
	});

	it('tailored-only added entry is ignored', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.content.work.push(makeWork('Tailored-only', 'Eng'));
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('master-removed entry the tailored still has is a removed item', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work = [];
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].change).toBe('removed');
		expect(encodePath(items[0].path)).toBe(`work/${job.objectId}/`);
	});

	it('matches entries by id regardless of order', () => {
		const a = makeWork('Acme', 'Eng');
		const b = makeWork('Beta', 'Eng');
		const master = makeMaster({ work: [a, b] });
		const tailored = makeTailored(master);
		tailored.content.work.reverse();
		master.content.work[0].position = 'Lead'; // change Acme's position on master
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(encodePath(items[0].path)).toBe(`work/${a.objectId}/position/`);
	});
});

describe('diffCVs - per-field granularity', () => {
	it('three changed fields in one entry produce three items', () => {
		const job = makeWork('Acme', 'Eng', { location: 'NYC' });
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work[0].name = 'Acme Corp';
		master.content.work[0].position = 'Lead';
		master.content.work[0].location = 'Berlin';
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(3);
		expect(items.every((i) => i.change === 'modified')).toBe(true);
	});

	it('surfaces a master-added nested highlight at its deep path', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		const hl = str('New highlight');
		master.content.work[0].highlights.push(hl);
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].change).toBe('added');
		expect(encodePath(items[0].path)).toBe(`work/${job.objectId}/highlights/${hl.objectId}/`);
	});
});

describe('diffCVs - hidden sections', () => {
	it('excludes a section hidden on the tailored side', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master, { hidden: ['work/'] });
		master.content.work[0].position = 'Lead';
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('excludes a section hidden on the master side', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] }, { hidden: ['work/'] });
		const tailored = makeTailored(master, { hidden: [] });
		master.content.work[0].position = 'Lead';
		expect(diffCVs(master, tailored)).toEqual([]);
	});
});
