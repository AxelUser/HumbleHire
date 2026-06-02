<script lang="ts">
	import CvEditorToolbar from '$lib/components/editor/cv-editor-toolbar.svelte';
	import { masterCv } from '../../dashboard/_mock-cv';
	import type { SaveStatus } from '$lib/types/save-status';

	const saveStatus: SaveStatus = { status: 'saved', savedAt: Date.now() - 8000 };
	let cvName = $state('Senior Developer — Stripe');
</script>

<CvEditorToolbar bind:cvName cv={masterCv} {saveStatus} />
