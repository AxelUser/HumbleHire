<script lang="ts">
	import CvEditorToolbar from '$lib/components/editor/cv-editor-toolbar.svelte';
	import { masterCv } from '../../dashboard/_mock-cv';
	import type { SaveStatus } from '$lib/types/save-status';

	const saveStatus: SaveStatus = { status: 'saving' };
	let cvName = $state('Frontend Lead — Vercel');
</script>

<CvEditorToolbar bind:cvName cv={masterCv} {saveStatus} />
