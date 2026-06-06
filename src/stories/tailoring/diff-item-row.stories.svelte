<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import DiffItemRow from '$lib/components/tailoring/diff-item-row.svelte';
	import type { ComponentProps } from 'svelte';
	import type { CV, CVContent, ObjectId, SkillCategory, WorkEntry } from '$lib/types/cv';
	import type { DiffItem } from '$lib/features/tailoring/types';
	import { computeHashes } from '$lib/features/tailoring/hash';
	import { emptyContent } from '$lib/services/cv/create';

	type Props = ComponentProps<typeof DiffItemRow>;

	const oid = (s: string) => s as unknown as ObjectId;
	const ID = {
		job1: oid('job1'),
		ach1: oid('ach1'),
		cat1: oid('cat1'),
		cs1: oid('cs1')
	};

	function mkJob(): WorkEntry {
		return {
			objectId: ID.job1,
			name: 'Stripe, Inc.',
			position: 'Senior Engineer',
			startDate: new Date(2021, 0, 1),
			endDate: undefined,
			current: true,
			highlights: [
				{ objectId: ID.ach1, value: 'Led the payments platform rewrite' },
				{ objectId: oid('ach2'), value: 'Cut checkout latency by 40%' }
			],
			keywords: [
				{ objectId: oid('kw1'), value: 'Go' },
				{ objectId: oid('kw2'), value: 'Kubernetes' }
			]
		};
	}

	function mkCat(): SkillCategory {
		return {
			objectId: ID.cat1,
			name: 'Languages',
			keywords: [
				{ objectId: ID.cs1, value: 'Rust' },
				{ objectId: oid('cs2'), value: 'Elixir' }
			]
		};
	}

	function mkContent(position: string): CVContent {
		const content = emptyContent();
		content.basics.fullName = 'Alex Smith';
		content.basics.position = position;
		content.work = [mkJob()];
		content.skills = [mkCat()];
		return content;
	}

	const masterContent = mkContent('Senior Software Engineer');
	const masterCv: CV = {
		id: 'master',
		name: 'Master CV',
		createdAt: 0,
		updatedAt: 0,
		content: masterContent,
		hashes: computeHashes(masterContent),
		hidden: []
	};

	const tailoredContent = mkContent('Software Engineer');
	const tailoredCv: CV = {
		id: 'tailored',
		name: 'Stripe — Engineer',
		createdAt: 0,
		updatedAt: 0,
		content: tailoredContent,
		hashes: computeHashes(tailoredContent),
		hidden: [],
		sourceId: 'master',
		baseline: masterContent,
		baselineHashes: computeHashes(masterContent)
	};

	const modifiedScalar: DiffItem = {
		change: 'modified',
		path: [{ field: 'basics' }, { field: 'position' }],
		before: 'Software Engineer',
		after: 'Senior Software Engineer'
	};

	const entryAddedItem: DiffItem = {
		change: 'added',
		path: [{ field: 'work' }, { id: ID.job1 }]
	};

	const entryRemovedItem: DiffItem = {
		change: 'removed',
		path: [{ field: 'skills' }, { id: ID.cat1 }]
	};

	const entryFieldModified: DiffItem = {
		change: 'modified',
		path: [{ field: 'work' }, { id: ID.job1 }, { field: 'position' }],
		before: 'Engineer',
		after: 'Senior Engineer'
	};

	const nestedAddedItem: DiffItem = {
		change: 'added',
		path: [{ field: 'work' }, { id: ID.job1 }, { field: 'highlights' }, { id: ID.ach1 }]
	};

	const nestedRemovedItem: DiffItem = {
		change: 'removed',
		path: [{ field: 'skills' }, { id: ID.cat1 }, { field: 'keywords' }, { id: ID.cs1 }]
	};

	const { Story } = defineMeta({
		title: 'Tailoring/DiffItemRow',
		component: DiffItemRow,
		tags: ['autodocs'],
		args: {
			item: modifiedScalar,
			masterCv,
			tailoredCv,
			decision: undefined,
			onAccept: fn(),
			onDiscard: fn(),
			onRevert: fn()
		}
	});
</script>

<Story name="ScalarModified">
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="EntryAdded" args={{ item: entryAddedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="EntryRemoved" args={{ item: entryRemovedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="EntryFieldModified" args={{ item: entryFieldModified }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="NestedAdded" args={{ item: nestedAddedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="NestedRemoved" args={{ item: nestedRemovedItem }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="Accepted" args={{ item: entryAddedItem, decision: 'accepted' }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="Discarded" args={{ item: entryRemovedItem, decision: 'discarded' }}>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4"><DiffItemRow {...args} /></div>
	{/snippet}
</Story>

<Story name="AllVariants" asChild>
	<div class="max-w-2xl space-y-2 p-4">
		{#each [modifiedScalar, entryAddedItem, entryRemovedItem, entryFieldModified, nestedAddedItem, nestedRemovedItem] as item, i (i)}
			<DiffItemRow
				{item}
				{masterCv}
				{tailoredCv}
				decision={undefined}
				onAccept={fn()}
				onDiscard={fn()}
				onRevert={fn()}
			/>
		{/each}
	</div>
</Story>
