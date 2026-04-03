import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { Achievement, CV, CVBlocks, JobEntry, ObjectId } from '$lib/types/cv';
import { diffCVs } from './diff';

function id(): ObjectId {
	return createObjectId();
}

function textBlock(value: string) {
	return { objectId: id(), value };
}

function makeJob(company: string, role: string): JobEntry {
	return {
		objectId: id(),
		company,
		role,
		startDate: undefined,
		endDate: undefined,
		achievements: [],
		skills: []
	};
}

function makeAchievement(text: string): Achievement {
	return { objectId: id(), text };
}

function emptyBlocks(): CVBlocks {
	return {
		fullName: textBlock('John Doe'),
		position: textBlock('Engineer'),
		location: textBlock('NYC'),
		contactsBlockId: id(),
		contacts: [],
		highlightsBlockId: id(),
		highlights: [],
		skillsBlockId: id(),
		skills: [],
		jobHistoryBlockId: id(),
		jobHistory: [],
		projectsBlockId: id(),
		projects: [],
		educationBlockId: id(),
		education: []
	};
}

function makeMaster(overrides?: Partial<CVBlocks>): CV {
	return {
		id: 'master-1',
		name: 'Master CV',
		notes: '',
		createdAt: 1000,
		updatedAt: 1000,
		version: 5,
		blocks: { ...emptyBlocks(), ...overrides },
		hiddenBlockIds: []
	};
}

function makeTailored(master: CV): CV {
	return {
		id: 'tailored-1',
		name: 'Tailored CV',
		notes: '',
		createdAt: 2000,
		updatedAt: 2000,
		version: 1,
		blocks: structuredClone(master.blocks),
		hiddenBlockIds: [],
		sourceId: master.id,
		syncBaseline: structuredClone(master.blocks),
		syncDecisions: { sourceSyncedVersion: master.version, discarded: {} }
	};
}

describe('diffCVs - text blocks', () => {
	it('no changes, no diff', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('tailored-only text change is ignored', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.blocks.fullName.value = 'Jane Smith';
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('master text change becomes textModified', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'Jane Smith';
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('textModified');
		expect(items[0].blockKey).toBe('fullName');
	});

	it('converging text changes to same value produce no diff', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'Same Name';
		tailored.blocks.fullName.value = 'Same Name';
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('textModified.before is tailored value, .after is master value', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.position.value = 'Senior Engineer';
		tailored.blocks.position.value = 'Current Tailored Position';
		const items = diffCVs(master, tailored);
		expect(items[0].type).toBe('textModified');
		if (items[0].type === 'textModified') {
			expect(items[0].before).toBe('Current Tailored Position');
			expect(items[0].after).toBe('Senior Engineer');
		}
	});
});

describe('diffCVs - jobHistory entries', () => {
	it('tailored-only job addition is ignored', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		tailored.blocks.jobHistory.push(makeJob('Tailored-Only Corp', 'Dev'));
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('new master job shows up as entryAdded', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.jobHistory.push(makeJob('Acme', 'Engineer'));
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('entryAdded');
		expect(items[0].blockKey).toBe('jobHistory');
	});

	it('tailored-only field edit is ignored', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		tailored.blocks.jobHistory[0].role = 'Senior Engineer';
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('master field change becomes entryModified', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].role = 'Staff Engineer';
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('entryModified');
	});

	it('conflicting edits on same field become entryModified', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].role = 'Staff Engineer';
		tailored.blocks.jobHistory[0].role = 'Senior Engineer';
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('entryModified');
	});

	it('converging edits on same field produce no diff', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].role = 'Staff Engineer';
		tailored.blocks.jobHistory[0].role = 'Staff Engineer';
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('master-deleted job that tailored kept becomes entryRemoved', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory = [];
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('entryRemoved');
		expect(items[0].blockKey).toBe('jobHistory');
	});

	it('tailored-only removal is ignored', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		tailored.blocks.jobHistory = [];
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('both sides removing same job produces no diff', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory = [];
		tailored.blocks.jobHistory = [];
		expect(diffCVs(master, tailored)).toEqual([]);
	});
});

describe('diffCVs - nested entries', () => {
	it('tailored-only achievement addition is ignored', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		tailored.blocks.jobHistory[0].achievements.push(makeAchievement('New tailored achievement'));
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('master-added nested entry carries parentObjectId', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].achievements.push(makeAchievement('Master achievement'));
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('entryAdded');
		if (items[0].type === 'entryAdded') {
			expect(items[0].parentObjectId).toBe(job.objectId);
		}
	});

	it('master-modified nested entry carries parentObjectId', () => {
		const ach = makeAchievement('Old text');
		const job = makeJob('Acme', 'Engineer');
		job.achievements.push(ach);
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].achievements[0].text = 'New text';
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('entryModified');
		if (items[0].type === 'entryModified') {
			expect(items[0].parentObjectId).toBe(job.objectId);
		}
	});

	it('master-deleted nested entry (kept by tailored) carries parentObjectId', () => {
		const ach = makeAchievement('Remove me');
		const job = makeJob('Acme', 'Engineer');
		job.achievements.push(ach);
		const master = makeMaster({ jobHistory: [job] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].achievements = [];
		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		expect(items[0].type).toBe('entryRemoved');
		if (items[0].type === 'entryRemoved') {
			expect(items[0].parentObjectId).toBe(job.objectId);
		}
	});
});

describe('diffCVs - hidden blocks', () => {
	it('hidden blocks are skipped even if master changed them', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: [job] });
		master.hiddenBlockIds = [master.blocks.jobHistoryBlockId];
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].role = 'Changed Role';
		expect(diffCVs(master, tailored)).toEqual([]);
	});
});
