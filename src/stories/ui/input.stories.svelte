<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Input from '$lib/components/ui/input/input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Input',
		component: Input,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<Input placeholder="Enter text..." class="w-64" />
</Story>

<Story name="WithValue" asChild>
	<Input value="Aleksey Maltsev" class="w-64" />
</Story>

<Story name="Disabled" asChild>
	<Input placeholder="Disabled input" disabled class="w-64" />
</Story>

<Story name="Password" asChild>
	<Input type="password" placeholder="Enter password" class="w-64" />
</Story>
