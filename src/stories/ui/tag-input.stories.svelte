<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TagInput from '$lib/components/ui/tag-input/tag-input.svelte';
	import TagInputWrapper from './helpers/TagInputWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/TagInput',
		component: TagInput,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<TagInputWrapper startTags={['React', 'TypeScript', 'Node.js']} />
</Story>

<Story name="Empty" asChild>
	<TagInputWrapper startTags={[]} />
</Story>

<Story name="Interactive" asChild>
	<TagInputWrapper startTags={['SvelteKit', 'Tailwind CSS']} />
</Story>

<Story name="ManyTags" asChild>
	<TagInputWrapper
		startTags={['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'Redis', 'Terraform', 'Go', 'Python']}
	/>
</Story>
