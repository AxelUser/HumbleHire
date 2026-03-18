<script lang="ts">
	import { setCVStoreContext, CVStore } from '$lib/stores/cv.svelte';
	import SaveVersionModal from '$lib/components/editor/save-version-modal.svelte';

	const mockStore = {
		saveStatus: 'saved',
		lastSavedAt: Date.now(),
		saveVersion: async () => {}
	} as unknown as CVStore;
	setCVStoreContext(mockStore);

	let open = $state(true);
</script>

<SaveVersionModal bind:open />
