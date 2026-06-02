import { describe, expect, it } from 'vitest';
import type { ObjectId } from '$lib/types/cv';
import { diffCVs } from './diff';
import { applySyncDecisions } from './apply';
import { computeBlockHashes } from './hash';
import {
	listBlock,
	makeAchievement,
	makeJob,
	makeMaster,
	makeTag,
	makeTailored
} from './_fixtures';

function refreshMasterHashes(master: {
	blocks: Parameters<typeof computeBlockHashes>[0];
	blockHashes: ReturnType<typeof computeBlockHashes>;
}) {
	master.blockHashes = computeBlockHashes(master.blocks);
}

describe('applySyncDecisions', () => {
	it('accepting textModified clears it from the next diff', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'New Master Name';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('baseline advances and accepted content lands in tailored when all items resolved', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'New Name';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.syncBaseline?.fullName.value).toBe('New Name');
		expect(tailored.blocks.fullName.value).toBe('New Name');
		expect(tailored.syncBaselineHashes?.fullName).toBe(master.blockHashes.fullName);
	});

	it('discard leaves tailored content alone but advances baseline (so next diff is empty)', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const tailoredOriginal = tailored.blocks.position.value;
		master.blocks.position.value = 'Staff Engineer';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'discarded']
		]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.blocks.position.value).toBe(tailoredOriginal);
		expect(tailored.syncBaseline?.position.value).toBe('Staff Engineer');
		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('a discarded change reappears only if master moves to a different value', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.position.value = 'Staff Engineer';
		refreshMasterHashes(master);

		applySyncDecisions(
			tailored,
			master,
			new Map<ObjectId, 'accepted' | 'discarded'>([
				[diffCVs(master, tailored)[0].objectId, 'discarded']
			])
		);

		master.blocks.position.value = 'Principal Engineer';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(1);
	});

	it('a discarded change stays discarded if master reverts to match tailored', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const originalPosition = tailored.blocks.position.value;
		master.blocks.position.value = 'Staff Engineer';
		refreshMasterHashes(master);

		applySyncDecisions(
			tailored,
			master,
			new Map<ObjectId, 'accepted' | 'discarded'>([
				[diffCVs(master, tailored)[0].objectId, 'discarded']
			])
		);

		master.blocks.position.value = originalPosition;
		refreshMasterHashes(master);

		expect(diffCVs(master, tailored)).toEqual([]);
	});

	it('baseline does NOT advance while any item is unresolved', () => {
		const job1 = makeJob('Acme', 'Engineer');
		const job2 = makeJob('Beta', 'Dev');
		const master = makeMaster({ jobHistory: listBlock([job1, job2]) });
		const tailored = makeTailored(master);
		master.blocks.jobHistory.value[0].role = 'Staff Engineer';
		master.blocks.jobHistory.value[1].role = 'Senior Dev';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		expect(items).toHaveLength(2);

		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);

		expect(tailored.syncBaseline?.jobHistory.value[0].role).toBe('Engineer');
		expect(tailored.syncBaselineHashes?.jobHistory).not.toBe(master.blockHashes.jobHistory);
	});

	it('syncBaseline is a deep clone, not a reference to master.blocks', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.blocks.fullName.value = 'New Name';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		const decisions = new Map<ObjectId, 'accepted' | 'discarded'>([
			[items[0].objectId, 'accepted']
		]);
		applySyncDecisions(tailored, master, decisions);

		const baselineNameAfter = tailored.syncBaseline?.fullName.value;
		master.blocks.fullName.value = 'Mutated after snapshot';
		expect(tailored.syncBaseline?.fullName.value).toBe(baselineNameAfter);
	});

	it('tailored.blockHashes is recomputed after Apply', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		const hashBefore = tailored.blockHashes.fullName;
		master.blocks.fullName.value = 'New Name';
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		applySyncDecisions(
			tailored,
			master,
			new Map<ObjectId, 'accepted' | 'discarded'>([[items[0].objectId, 'accepted']])
		);

		expect(tailored.blockHashes.fullName).not.toBe(hashBefore);
		expect(tailored.blockHashes.fullName).toBe(master.blockHashes.fullName);
	});
});

describe('applySyncDecisions — nested lists', () => {
	it('accepting nested entryAdded: achievement lands in achievements, not job.skills', () => {
		const job = makeJob('Acme', 'Engineer');
		const master = makeMaster({ jobHistory: listBlock([job]) });
		const tailored = makeTailored(master);

		const newAch = makeAchievement('Built the thing');
		master.blocks.jobHistory.value[0].achievements.push(newAch);
		refreshMasterHashes(master);

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
		refreshMasterHashes(master);

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
		refreshMasterHashes(master);

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
		refreshMasterHashes(master);

		const items = diffCVs(master, tailored);
		const modifiedItem = items.find((i) => i.objectId === ach.objectId);
		expect(modifiedItem).toBeDefined();

		applySyncDecisions(tailored, master, new Map([[modifiedItem!.objectId, 'accepted']]));

		expect(tailored.blocks.jobHistory.value[0].achievements[0].text).toBe('New text');
	});
});
