<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

	const { Story } = defineMeta({
		title: 'UI/Textarea',
		component: Textarea,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
		<Textarea placeholder="Enter your text here..." class="w-64" />
</Story>

<Story name="WithValue">
		<Textarea value="Pragmatic engineer with a bias for shipping fast." class="w-64" rows={4} />
</Story>
