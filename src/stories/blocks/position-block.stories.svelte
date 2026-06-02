<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextBlock from '$lib/components/blocks/text-block.svelte';
	import PositionWrapper from './helpers/PositionWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Position',
		component: TextBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<PositionWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<PositionWrapper startVisible={false} />
</Story>
