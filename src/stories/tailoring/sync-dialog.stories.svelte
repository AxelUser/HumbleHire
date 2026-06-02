<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SyncDrawer from '$lib/components/tailoring/sync-drawer.svelte';
	import SyncDialogWithChangesWrapper from './helpers/SyncDialogWithChangesWrapper.svelte';
	import SyncDialogNoChangesWrapper from './helpers/SyncDialogNoChangesWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Tailoring/SyncDrawer',
		component: SyncDrawer,
		tags: ['autodocs']
	});
</script>

<Story name="WithChanges" asChild>
	<SyncDialogWithChangesWrapper />
</Story>

<Story name="NoChanges" asChild>
	<SyncDialogNoChangesWrapper />
</Story>
