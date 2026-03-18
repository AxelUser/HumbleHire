<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Collapsible from '$lib/components/ui/collapsible/collapsible.svelte';
	import CollapsibleWrapper from './helpers/CollapsibleWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/Collapsible',
		component: Collapsible,
		tags: ['autodocs']
	});
</script>

<Story name="Collapsed" asChild>
		<CollapsibleWrapper startOpen={false} />
</Story>

<Story name="Expanded" asChild>
		<CollapsibleWrapper startOpen={true} />
</Story>

<Story name="Interactive" asChild>
		<CollapsibleWrapper />
</Story>
