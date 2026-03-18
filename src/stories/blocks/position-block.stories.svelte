<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PositionBlock from '$lib/components/blocks/position-block.svelte';
	import PositionWrapper from './helpers/PositionWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Position',
		component: PositionBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
		<PositionWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
		<PositionWrapper startVisible={false} />
</Story>
