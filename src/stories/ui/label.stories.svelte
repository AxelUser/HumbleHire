<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Label',
		component: Label,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<Label>Full Name</Label>
</Story>

<Story name="PairedWithInput" asChild>
	<div class="flex w-64 flex-col gap-1.5">
		<Label for="name-input">Full Name</Label>
		<Input id="name-input" placeholder="Aleksey Maltsev" />
	</div>
</Story>
