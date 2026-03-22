<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EducationBlock from '$lib/components/blocks/education-block.svelte';
	import EducationWrapper from './helpers/EducationWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Education',
		component: EducationBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<EducationWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<EducationWrapper startVisible={false} />
</Story>

<Story name="Empty" asChild>
	<EducationWrapper startEmpty={true} />
</Story>
