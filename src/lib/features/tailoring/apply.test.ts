import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { CV, CVBlocks, JobEntry, Achievement, Tag, ObjectId } from '$lib/types/cv';
import { diffCVs } from './diff';
import { applySyncDecisions } from './apply';

function id(): ObjectId {
	return createObjectId();
}

function textBlock(value: string) {
	return { objectId: id(), value };
}

function listBlock<T>(value: T) {
	return { objectId: id(), value };
}

function makeAchievement(text: string): Achievement {
	return { objectId: id(), text };
}

function makeTag(value: string): Tag {
	return { objectId: id(), value };
}

function makeJob(company: string, role: string): JobEntry {
	return {
		objectId: id(),
		company,
		role,
		startDate: undefined,
		endDate: undefined,
		current: false,
		achievements: [],
		skills: []
	};
}

function emptyBlocks(): CVBlocks {
	return {
		fullName: textBlock('John Doe'),
		position: textBlock('Engineer'),
		location: textBlock('NYC'),
		contacts: listBlock([]),
		highlights: listBlock([]),
		skills: listBlock([]),
		jobHistory: listBlock([]),
		projects: listBlock([]),
		education: listBlock([])
	};
}

function makeMaster(overrides?: Partial<CVBlocks>): CV {
	return {
		id: 'master-1',
		name: 'Master CV',
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

describe('applySyncDecisions', () => {
	it('accepting textModified clears it from the next diff', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'New Master Name';
		master.version = 6;

		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('baseline and version advance when all items resolved', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'New Name';
		master.version = 6;

		const items = diffCVs(master, tailored);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.syncDecisions?.sourceSyncedVersion).toBe(6);
		expect(tailored.syncBaseline?.fullName.value).toBe('New Name');
	});

	it('syncBaseline is a deep clone, not a reference to master.blocks', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'New Name';
		master.version = 6;

		const items = diffCVs(master, tailored);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);

		const baselineNameAfter = tailored.syncBaseline?.fullName.value;
		master.blocks.fullName.value = 'Mutated after snapshot';
		expect(tailored.syncBaseline?.fullName.value).toBe(baselineNameAfter);
	});

	it('baseline stays frozen while any item is unresolved', () => {
		const job1 = makeJob('Acme', 'Engineer');
		const job2 = makeJob('Beta', 'Dev');
		const master = makeMaster({ jobHistory: listBlock([job1, job2]) });
		const tailored = makeTailored(master);
		master.blocks.jobHistory.value[0].role = 'Staff Engineer';
		master.blocks.jobHistory.value[1].role = 'Senior Dev';
		master.version = 6;

		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(2);

		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.syncDecisions?.sourceSyncedVersion).toBe(5);
		expect(tailored.syncBaseline?.jobHistory.value[0].role).toBe('Engineer');
	});

	it('each discard records the master version', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.position.value = 'Staff Engineer';
		master.version = 6;

		const items = diffCVs(master, tailored);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'discarded']
		]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.syncDecisions?.discarded[items[0].objectId]).toBe(6);
	});

	it('stale discard clears when the field changes again', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.position.value = 'Staff Engineer';
		master.version = 6;

		const items = diffCVs(master, tailored);
		const discardedId = items[0].objectId;
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([[discardedId, 'discarded']]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.syncDecisions?.discarded[discardedId]).toBe(6);

		master.blocks.position.value = 'Principal Engineer';
		master.version = 7;

		const items2 = diffCVs(master, tailored);
		expect(items2).toHaveLength(1);

		applySyncDecisions(
			tailored,
			master,
			new Map<ObjectId, 'accepted' | 'discarded'>([[items2[0].objectId, 'accepted']])
		);

		expect(Object.keys(tailored.syncDecisions?.discarded ?? {})).toHaveLength(0);
	});
});

describe('applySyncDecisions — nested lists', () => {
	it('accepting nested entryAdded: achievement lands in achievements, not job.skills', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);

		const newAch = makeAchievement('Built the thing');
		master.blocks.jobHistory.value[0].achievements.push(newAch);
		master.version = 6;

		const items = diffCVs(master, tailored);
		const addedItem = items.find((i) => i.objectId === newAch.objectId);
		expect(addedItem).toBeDefined();

		applySyncDecisions(tailored, master, new Map([[addedItem!.objectId, 'accepted']]));

		const tailoredJob = tailored.blocks.jobHistory.value[0];
		expect(tailoredJob.achievements).toHaveLength(1);
		expect(tailoredJob.achievements[0].text).toBe('Built the thing');
		expect(tailoredJob.skills).toHaveLength(0);
	});

	it('accepting nested entryAdded: job skill lands in job.skills, not achievements', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);

		const newSkill = makeTag('TypeScript');
		master.blocks.jobHistory.value[0].skills.push(newSkill);
		master.version = 6;

		const items = diffCVs(master, tailored);
		const addedItem = items.find((i) => i.objectId === newSkill.objectId);
		expect(addedItem).toBeDefined();

		applySyncDecisions(tailored, master, new Map([[addedItem!.objectId, 'accepted']]));

		const tailoredJob = tailored.blocks.jobHistory.value[0];
		expect(tailoredJob.skills).toHaveLength(1);
		expect(tailoredJob.skills[0].value).toBe('TypeScript');
		expect(tailoredJob.achievements).toHaveLength(0);
	});

	it('accepting nested entryRemoved: removes only from achievements, leaves job.skills intact', () => {
		const ach = makeAchievement('Old achievement');
		const skill = makeTag('Go');
		const job = makeJob('Acme', 'Engineer');
		job.achievements.push(ach);
		job.skills.push(skill);

		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);

		master.blocks.jobHistory.value[0].achievements = [];
		master.version = 6;

		const items = diffCVs(master, tailored);
		const removedItem = items.find((i) => i.objectId === ach.objectId);
		expect(removedItem).toBeDefined();

		applySyncDecisions(tailored, master, new Map([[removedItem!.objectId, 'accepted']]));

		const tailoredJob = tailored.blocks.jobHistory.value[0];
		expect(tailoredJob.achievements).toHaveLength(0);
		expect(tailoredJob.skills).toHaveLength(1);
	});

	it('accepting nested entryModified: updates the correct achievement', () => {
		const ach = makeAchievement('Old text');
		const job = makeJob('Acme', 'Engineer');
		job.achievements.push(ach);

		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);

		master.blocks.jobHistory.value[0].achievements[0].text = 'New text';
		master.version = 6;

		const items = diffCVs(master, tailored);
		const modifiedItem = items.find((i) => i.objectId === ach.objectId);
		expect(modifiedItem).toBeDefined();

		applySyncDecisions(tailored, master, new Map([[modifiedItem!.objectId, 'accepted']]));

		expect(tailored.blocks.jobHistory.value[0].achievements[0].text).toBe('New text');
	});
});
