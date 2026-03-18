<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FullNameBlock from '$lib/components/blocks/full-name-block.svelte';
	import FullNameWrapper from './helpers/FullNameWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/FullName',
		component: FullNameBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
		<FullNameWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
		<FullNameWrapper startVisible={false} />
</Story>
