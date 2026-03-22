<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LocationBlock from '$lib/components/blocks/location-block.svelte';
	import LocationWrapper from './helpers/LocationWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Location',
		component: LocationBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<LocationWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<LocationWrapper startVisible={false} />
</Story>
