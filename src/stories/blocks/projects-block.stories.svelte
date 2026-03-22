<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProjectsBlock from '$lib/components/blocks/projects-block.svelte';
	import ProjectsWrapper from './helpers/ProjectsWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Projects',
		component: ProjectsBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<ProjectsWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<ProjectsWrapper startVisible={false} />
</Story>

<Story name="Empty" asChild>
	<ProjectsWrapper startEmpty={true} />
</Story>
