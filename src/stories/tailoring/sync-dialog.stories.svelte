<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SyncDialog from '$lib/components/tailoring/sync-dialog.svelte';
	import SyncDialogWithChangesWrapper from './helpers/SyncDialogWithChangesWrapper.svelte';
	import SyncDialogNoChangesWrapper from './helpers/SyncDialogNoChangesWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Tailoring/SyncDialog',
		component: SyncDialog,
		tags: ['autodocs']
	});
</script>

<Story name="WithChanges" asChild>
	<SyncDialogWithChangesWrapper />
</Story>

<Story name="NoChanges" asChild>
	<SyncDialogNoChangesWrapper />
</Story>
