<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InlineField from '$lib/components/ui/inline-field/inline-field.svelte';
	import InlineFieldWrapper from './helpers/InlineFieldWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/InlineField',
		component: InlineField,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
		<InlineField value="Aleksey Maltsev" placeholder="Enter name..." />
</Story>

<Story name="Empty">
		<InlineField value="" placeholder="Click to edit..." />
</Story>

<Story name="Interactive" asChild>
		<InlineFieldWrapper />
</Story>
