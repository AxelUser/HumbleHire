<script lang="ts">
	import SyncDrawer from '$lib/components/tailoring/sync-drawer.svelte';
	import type { CV, CVContent } from '$lib/types/cv';
	import { computeHashes } from '$lib/features/tailoring/hash';
	import { emptyContent } from '$lib/services/cv/create';

	function mkContent(position: string): CVContent {
		const content = emptyContent();
		content.basics.fullName = 'Alex Smith';
		content.basics.position = position;
		content.basics.location = 'San Francisco, CA';
		return content;
	}

	const masterContent = mkContent('Senior Software Engineer');
	const masterCv: CV = {
		id: 'master-1',
		name: 'Master CV',
		createdAt: Date.now() - 86400000 * 7,
		updatedAt: Date.now() - 3600000,
		content: masterContent,
		hashes: computeHashes(masterContent),
		hidden: []
	};

	const tailoredContent = mkContent('Software Engineer');
	const baselineContent = mkContent('Software Engineer');
	const tailoredCv: CV = {
		id: 'tailored-1',
		name: 'Stripe — Engineer',
		createdAt: Date.now() - 86400000 * 3,
		updatedAt: Date.now() - 86400000,
		content: tailoredContent,
		hashes: computeHashes(tailoredContent),
		hidden: [],
		sourceId: 'master-1',
		baseline: baselineContent,
		baselineHashes: computeHashes(baselineContent)
	};

	let open = $state(false);
</script>

<SyncDrawer {masterCv} {tailoredCv} onSync={() => {}} bind:open />
