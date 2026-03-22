<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HighlightsBlock from '$lib/components/blocks/highlights-block.svelte';
	import HighlightsWrapper from './helpers/HighlightsWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Highlights',
		component: HighlightsBlock,
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
