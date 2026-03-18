<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Input from '$lib/components/ui/input/input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Input',
		component: Input,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
		<Input placeholder="Enter text..." class="w-64" />
</Story>

<Story name="WithValue">
		<Input value="Aleksey Maltsev" class="w-64" />
</Story>

<Story name="Disabled">
		<Input placeholder="Disabled input" disabled class="w-64" />
</Story>

<Story name="Password">
		<Input type="password" placeholder="Enter password" class="w-64" />
</Story>
