<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Hero from '$lib/components/dashboard/hero.svelte';

	const { Story } = defineMeta({
		title: 'Dashboard/Hero',
		component: Hero,
		tags: ['autodocs']
	});
</script>

<Story name="Default" />
