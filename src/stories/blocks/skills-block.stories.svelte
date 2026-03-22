<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SkillsBlock from '$lib/components/blocks/skills-block.svelte';
	import SkillsWrapper from './helpers/SkillsWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Skills',
		component: SkillsBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<SkillsWrapper startVisible={true} />
</Story>

<Story name="WithCategories" asChild>
	<SkillsWrapper startVisible={true} startWithCategories={true} />
</Story>

<Story name="Empty" asChild>
	<SkillsWrapper startVisible={true} startEmpty={true} />
</Story>

<Story name="Hidden" asChild>
	<SkillsWrapper startVisible={false} />
</Story>
