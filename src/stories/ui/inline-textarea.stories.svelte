<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InlineTextarea from '$lib/components/ui/inline-textarea/inline-textarea.svelte';
	import InlineTextareaWrapper from './helpers/InlineTextareaWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/InlineTextarea',
		component: InlineTextarea,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
		<InlineTextarea value="Pragmatic engineer with a bias for shipping." placeholder="Enter text..." rows={3} />
</Story>

<Story name="Empty">
		<InlineTextarea value="" placeholder="Click to edit..." rows={3} />
</Story>

<Story name="Interactive" asChild>
		<InlineTextareaWrapper />
</Story>
