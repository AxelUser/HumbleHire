<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextBlock from '$lib/components/blocks/text-block.svelte';
	import LocationWrapper from './helpers/LocationWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Location',
		component: TextBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<LocationWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<LocationWrapper startVisible={false} />
</Story>
