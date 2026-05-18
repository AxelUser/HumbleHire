<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SyncModal from '$lib/components/sync/sync-modal.svelte';
	import SyncModalWithChangesWrapper from './helpers/SyncModalWithChangesWrapper.svelte';
	import SyncModalNoChangesWrapper from './helpers/SyncModalNoChangesWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Sync/SyncModal',
		component: SyncModal,
		tags: ['autodocs']
	});
</script>

<Story name="WithChanges" asChild>
	<SyncModalWithChangesWrapper />
</Story>

<Story name="NoChanges" asChild>
	<SyncModalNoChangesWrapper />
</Story>
