<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SearchBar from '$lib/components/dashboard/search-bar.svelte';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof SearchBar>;

	const { Story } = defineMeta({
		title: 'Dashboard/SearchBar',
		component: SearchBar,
		tags: ['autodocs']
	});
</script>

<Story name="Default" args={{ masterCount: 3, tailoredCount: 4 }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl p-4">
			<SearchBar {...args} />
		</div>
	{/snippet}
</Story>

<Story name="SingleMaster" args={{ masterCount: 1, tailoredCount: 1 }}>
	{#snippet template(args: Props)}
		<div class="max-w-3xl p-4">
			<SearchBar {...args} />
		</div>
	{/snippet}
</Story>
