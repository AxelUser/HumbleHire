<script lang="ts">
	import { setCVStoreContext, CVStore } from '$lib/stores/cv.svelte';
	import CvEditorToolbar from '$lib/components/editor/cv-editor-toolbar.svelte';

	const mockStore = {
		saveStatus: 'saving',
		lastSavedAt: null
	} as unknown as CVStore;
	setCVStoreContext(mockStore);

	let cvName = $state('Frontend Lead — Vercel');
</script>

<CvEditorToolbar bind:cvName />
