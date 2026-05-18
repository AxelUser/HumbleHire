<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import DiffItemRow from '$lib/components/tailoring/diff-item-row.svelte';
	import type { ComponentProps } from 'svelte';
	import type { DiffViewItem } from '$lib/features/tailoring/types';
	import type { ObjectId } from '$lib/types/cv';

	type Props = ComponentProps<typeof DiffItemRow>;

	const id = (s: string) => s as unknown as ObjectId;

	const textModifiedItem: DiffViewItem = {
		objectId: id('obj-text'),
		type: 'textModified',
		blockKey: 'position',
		blockLabel: 'Position',
		description: 'Changed Position',
		before: 'Software Engineer',
		after: 'Senior Software Engineer'
	};

	const entryAddedItem: DiffViewItem = {
		objectId: id('obj-added'),
		type: 'entryAdded',
		blockKey: 'jobHistory',
		blockLabel: 'Job History',
		description: 'Added entry to Job History'
	};

	const entryRemovedItem: DiffViewItem = {
		objectId: id('obj-removed'),
		type: 'entryRemoved',
		blockKey: 'jobHistory',
		blockLabel: 'Job History',
		description: 'Removed entry from Job History'
	};

	const entryModifiedItem: DiffViewItem = {
		objectId: id('obj-modified'),
		type: 'entryModified',
		blockKey: 'jobHistory',
		blockLabel: 'Job History',
		description: 'Modified title, period in Job History',
		before: 'title: Engineer, period: 2020–2022',
		after: 'title: Senior Engineer, period: 2020–2023'
	};

	const nestedAddedItem: DiffViewItem = {
		objectId: id('obj-nested'),
		type: 'entryAdded',
		blockKey: 'jobHistory',
		blockLabel: 'Job History',
		description: 'Added entry to Job History (nested)',
		parentObjectId: id('parent-job')
	};

	const { Story } = defineMeta({
		title: 'Tailoring/DiffItemRow',
		component: DiffItemRow,
		tags: ['autodocs'],
		args: {
			item: textModifiedItem,
			decision: undefined,
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

<Story name="NestedEntry" args={{ item: nestedAddedItem }}>
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

<Story
	name="PreviouslyDiscarded"
	args={{ item: { ...entryAddedItem, objectId: id('obj-prev'), previouslyDiscarded: true } }}
>
	{#snippet template(args: Props)}
		<div class="max-w-2xl p-4">
			<DiffItemRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="AllVariants" asChild>
	<div class="max-w-2xl space-y-2 p-4">
		<DiffItemRow
			item={textModifiedItem}
			decision={undefined}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={entryAddedItem}
			decision={undefined}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={entryRemovedItem}
			decision={undefined}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={entryModifiedItem}
			decision={undefined}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={nestedAddedItem}
			decision={undefined}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={{ ...entryAddedItem, objectId: id('obj-acc'), previouslyDiscarded: true }}
			decision={undefined}
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={{ ...entryAddedItem, objectId: id('obj-acc2') }}
			decision="accepted"
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
		<DiffItemRow
			item={{ ...entryRemovedItem, objectId: id('obj-dis') }}
			decision="discarded"
			onAccept={fn()}
			onDiscard={fn()}
			onRevert={fn()}
		/>
	</div>
</Story>
