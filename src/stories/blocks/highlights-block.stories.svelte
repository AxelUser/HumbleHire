<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BulletListBlock from '$lib/components/blocks/bullet-list-block.svelte';
	import HighlightsWrapper from './helpers/HighlightsWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Highlights',
		component: BulletListBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<HighlightsWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<HighlightsWrapper startVisible={false} />
</Story>

<Story name="Empty" asChild>
	<HighlightsWrapper startEmpty={true} />
</Story>
