<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PanelCard from '$lib/components/ui/panel-card/panel-card.svelte';
	import PanelCardWithActionWrapper from './helpers/PanelCardWithActionWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/PanelCard',
		component: PanelCard,
		tags: ['autodocs']
	});
</script>

<Story name="WithTitle">
		<PanelCard title="Work Experience" class="w-72">
			<p class="text-sm text-muted-foreground">Panel body content.</p>
		</PanelCard>
</Story>

<Story name="WithTitleAndAction" asChild>
		<PanelCardWithActionWrapper />
</Story>

<Story name="NoHeader">
		<PanelCard class="w-72">
			<p class="text-sm text-muted-foreground">No header, just content.</p>
		</PanelCard>
</Story>
