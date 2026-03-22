<script lang="ts">
	import { setCVStoreContext, CVStore } from '$lib/stores/cv.svelte';
	import CvEditorToolbar from '$lib/components/editor/cv-editor-toolbar.svelte';

	const mockStore = {
		saveStatus: 'saved',
		lastSavedAt: Date.now() - 8000
	} as unknown as CVStore;
	setCVStoreContext(mockStore);

	let cvName = $state('Senior Developer — Stripe');
</script>

<CvEditorToolbar bind:cvName />
