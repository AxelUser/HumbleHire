<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '$lib/components/layout/header.svelte';

	const { Story } = defineMeta({
		title: 'Layout/Header',
		component: Header,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Default">
		<Header />
</Story>
