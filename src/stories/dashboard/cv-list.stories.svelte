<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CvList from '$lib/components/dashboard/cv-list.svelte';
	import { fn } from 'storybook/test';
	import type { ComponentProps } from 'svelte';
	import { masterCv, masterCv2, syncedTailored, staleTailored } from './_mock-cv';

	type Props = ComponentProps<typeof CvList>;

	const { Story } = defineMeta({
		title: 'Dashboard/CvList',
		component: CvList,
		tags: ['autodocs'],
		args: { onDelete: fn(), onTailor: fn(), onSync: fn() }
	});
</script>

<Story
	name="WithLineage"
	args={{
		cvs: [masterCv, syncedTailored, staleTailored, masterCv2]
	}}
>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<CvList {...args} />
		</div>
	{/snippet}
</Story>

<Story name="SingleMasterNoChildren" args={{ cvs: [masterCv] }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<CvList {...args} />
		</div>
	{/snippet}
</Story>
