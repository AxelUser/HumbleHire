<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MasterGroup from '$lib/components/dashboard/master-group.svelte';
	import { fn } from 'storybook/test';
	import type { ComponentProps } from 'svelte';
	import { masterCv, masterCv2, syncedTailored, staleTailored } from './_mock-cv';

	type Props = ComponentProps<typeof MasterGroup>;

	const { Story } = defineMeta({
		title: 'Dashboard/MasterGroup',
		component: MasterGroup,
		tags: ['autodocs'],
		args: { onDelete: fn(), onTailor: fn(), onSync: fn() }
	});
</script>

<Story
	name="WithMixedChildren"
	args={{ master: masterCv, tailored: [syncedTailored, staleTailored] }}
>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<MasterGroup {...args} />
		</div>
	{/snippet}
</Story>

<Story name="WithSyncedChild" args={{ master: masterCv, tailored: [syncedTailored] }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<MasterGroup {...args} />
		</div>
	{/snippet}
</Story>

<Story name="EmptyChildren" args={{ master: masterCv2, tailored: [] }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<MasterGroup {...args} />
		</div>
	{/snippet}
</Story>
