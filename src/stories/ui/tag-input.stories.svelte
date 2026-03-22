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
	<TagInput tags={['React', 'TypeScript', 'Node.js']} placeholder="Add a tag..." />
</Story>

<Story name="Empty" asChild>
	<TagInput tags={[]} placeholder="Add a tag..." />
</Story>

<Story name="Interactive" asChild>
	<TagInputWrapper startTags={['SvelteKit', 'Tailwind CSS']} />
</Story>

<Story name="ManyTags" asChild>
	<TagInput
		tags={[
			'React',
			'TypeScript',
			'Node.js',
			'PostgreSQL',
			'Docker',
			'Kubernetes',
			'AWS',
			'GraphQL',
			'Redis',
			'Terraform',
			'Go',
			'Python'
		]}
		placeholder="Add a tag..."
	/>
</Story>
