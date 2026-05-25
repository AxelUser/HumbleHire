<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import DiffItemRow from '$lib/components/tailoring/diff-item-row.svelte';
	import type { ComponentProps } from 'svelte';
	import type { CV, CVBlocks, JobEntry, ObjectId, SkillCategory } from '$lib/types/cv';
	import type { DiffItem } from '$lib/features/tailoring/types';

	type Props = ComponentProps<typeof DiffItemRow>;

	const mkId = (s: string) => s as unknown as ObjectId;

	// Shared block objectIds so master and tailored can share references
	const IDS = {
		fn: mkId('fn'),
		pos: mkId('pos'),
		loc: mkId('loc'),
		cb: mkId('cb'),
		hb: mkId('hb'),
		sb: mkId('sb'),
		jb: mkId('jb'),
		pb: mkId('pb'),
		eb: mkId('eb'),
		job1: mkId('job1'),
		ach1: mkId('ach1'),
		skill1: mkId('skill1'),
		cat1: mkId('cat1'),
		catSkill1: mkId('catSkill1')
	};

	const job: JobEntry = {
		objectId: IDS.job1,
		company: 'Stripe, Inc.',
		role: 'Senior Engineer',
		startDate: new Date(2021, 0, 1),
		endDate: undefined,
		achievements: [
			{ objectId: IDS.ach1, text: 'Led the payments platform rewrite' },
			{ objectId: mkId('ach2'), text: 'Cut checkout latency by 40%' }
		],
		skills: [
			{ objectId: IDS.skill1, value: 'Go' },
			{ objectId: mkId('skill2'), value: 'Kubernetes' }
		]
	};

	const cat: SkillCategory = {
		objectId: IDS.cat1,
		name: 'Languages',
		skills: [
			{ objectId: IDS.catSkill1, value: 'Rust' },
			{ objectId: mkId('cs2'), value: 'Elixir' }
		]
	};

	function mkBlocks(position: string, withJob = false, withCat = false): CVBlocks {
		return {
			fullName: { objectId: IDS.fn, value: 'Alex Smith' },
			position: { objectId: IDS.pos, value: position },
			location: { objectId: IDS.loc, value: 'San Francisco, CA' },
			contacts: { objectId: IDS.cb, value: [] },
			highlights: { objectId: IDS.hb, value: [] },
			skills: { objectId: IDS.sb, value: withCat ? [cat] : [] },
			jobHistory: { objectId: IDS.jb, value: withJob ? [job] : [] },
			projects: { objectId: IDS.pb, value: [] },
			education: { objectId: IDS.eb, value: [] }
		};
	}

	const masterCv: CV = {
		id: 'master',
		name: 'Master CV',
		version: 2,
		createdAt: 0,
		updatedAt: 0,
		blocks: mkBlocks('Senior Software Engineer', true, true),
		hiddenBlockIds: []
	};

	const tailoredCv: CV = {
		id: 'tailored',
		name: 'Stripe — Engineer',
		version: 1,
		createdAt: 0,
		updatedAt: 0,
		blocks: mkBlocks('Software Engineer', true, true),
		hiddenBlockIds: [],
		sourceId: 'master'
	};

	// --- diff items ---

	const textItem: DiffItem = {
		kind: 'text',
		blockKey: 'position',
		objectId: IDS.pos,
		before: 'Software Engineer',
		after: 'Senior Software Engineer'
	};

	const entryAddedItem: DiffItem = {
		kind: 'entry',
		change: 'added',
		blockKey: 'jobHistory',
		objectId: IDS.job1
	};

	const entryRemovedItem: DiffItem = {
		kind: 'entry',
		change: 'removed',
		blockKey: 'skills',
		objectId: IDS.cat1
	};

	const entryModifiedItem: DiffItem = {
		kind: 'entry',
		change: 'modified',
		blockKey: 'jobHistory',
		objectId: IDS.job1,
		before: { role: 'Engineer', endDate: undefined },
		after: { role: 'Senior Engineer', endDate: new Date(2023, 5, 1) }
	};

	const nestedAddedItem: DiffItem = {
		kind: 'nested',
		change: 'added',
		blockKey: 'jobHistory',
		nestedListKey: 'achievements',
		parentObjectId: IDS.job1,
		objectId: IDS.ach1
	};

	const nestedRemovedItem: DiffItem = {
		kind: 'nested',
		change: 'removed',
		blockKey: 'skills',
		nestedListKey: 'skills',
		parentObjectId: IDS.cat1,
		objectId: IDS.catSkill1
	};

	const { Story } = defineMeta({
		title: 'Tailoring/DiffItemRow',
		component: DiffItemRow,
		tags: ['autodocs'],
		args: {
			item: textItem,
			masterCv,
			tailoredCv,
			decision: undefined,
			previouslyDiscarded: false,
			onAccept: fn(),
			onDiscard: fn(),
			onRevert: fn()
		}
	});
</script>

<Story name="TextModified">
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="EntryAdded" args={{ item: entryAddedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="EntryRemoved" args={{ item: entryRemovedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="EntryModified" args={{ item: entryModifiedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="NestedAdded" args={{ item: nestedAddedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="NestedRemoved" args={{ item: nestedRemovedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Accepted" args={{ item: entryAddedItem, decision: 'accepted' }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Discarded" args={{ item: entryRemovedItem, decision: 'discarded' }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="PreviouslyDiscarded" args={{ item: entryAddedItem, previouslyDiscarded: true }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="AllVariants" asChild>
	<div class="max-w-2xl space-y-2 p-4">
		{#each [textItem, entryAddedItem, entryRemovedItem, entryModifiedItem, nestedAddedItem, nestedRemovedItem] as item, i (i)}
			<DiffItemRow
				{item}
				{masterCv}
				{tailoredCv}
				decision={undefined}
				previouslyDiscarded={false}
				onAccept={fn()}
				onDiscard={fn()}
				onRevert={fn()}
			/>
		{/each}
		<DiffItemRow
			item={entryAddedItem}
			{masterCv}
			{tailoredCv}
			decision={undefined}
			previouslyDiscarded={true}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={entryAddedItem}
			{masterCv}
			{tailoredCv}
			decision="accepted"
			previouslyDiscarded={false}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={entryRemovedItem}
			{masterCv}
			{tailoredCv}
			decision="discarded"
			previouslyDiscarded={false}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
	</div>
</Story>
