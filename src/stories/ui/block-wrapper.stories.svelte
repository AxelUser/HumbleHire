<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BlockWrapper from '$lib/components/ui/block-wrapper/block-wrapper.svelte';
	import BlockWrapperWrapper from './helpers/BlockWrapperWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/BlockWrapper',
		component: BlockWrapper,
		tags: ['autodocs']
	});
</script>

<Story name="Visible" asChild>
	<BlockWrapperWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<BlockWrapperWrapper startVisible={false} />
</Story>
