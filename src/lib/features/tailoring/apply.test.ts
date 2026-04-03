import { describe, expect, it } from 'vitest';
import { createObjectId } from '$lib/types/cv';
import type { CV, CVBlocks, JobEntry, ObjectId } from '$lib/types/cv';
import { diffCVs } from './diff';
import { applySyncDecisions } from './apply';

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
		const master = makeMaster({ jobHistory: [job1, job2] });
		const tailored = makeTailored(master);
		master.blocks.jobHistory[0].role = 'Staff Engineer';
		master.blocks.jobHistory[1].role = 'Senior Dev';
		master.version = 6;

		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(2);

		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.syncDecisions?.sourceSyncedVersion).toBe(5);
		expect(tailored.syncBaseline?.jobHistory[0].role).toBe('Engineer');
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
