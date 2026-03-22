<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import JobHistoryBlock from '$lib/components/blocks/job-history-block.svelte';
	import JobHistoryWrapper from './helpers/JobHistoryWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/JobHistory',
		component: JobHistoryBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<JobHistoryWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<JobHistoryWrapper startVisible={false} />
</Story>

<Story name="Empty" asChild>
	<JobHistoryWrapper startEmpty={true} />
</Story>
