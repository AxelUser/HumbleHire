<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TailoredRow from '$lib/components/dashboard/tailored-row.svelte';
	import { fn } from 'storybook/test';
	import type { ComponentProps } from 'svelte';
	import { masterCv, syncedTailored, staleTailored } from './_mock-cv';

	type Props = ComponentProps<typeof TailoredRow>;

	const { Story } = defineMeta({
		title: 'Dashboard/TailoredRow',
		component: TailoredRow,
		tags: ['autodocs'],
		args: { master: masterCv, onDelete: fn(), onSync: fn() }
	});
</script>

<Story name="InSync" args={{ cv: syncedTailored, isLast: true }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<TailoredRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="MasterUpdated" args={{ cv: staleTailored, isLast: false }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<TailoredRow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="NotLast" args={{ cv: syncedTailored, isLast: false }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl">
			<TailoredRow {...args} />
		</div>
	{/snippet}
</Story>
