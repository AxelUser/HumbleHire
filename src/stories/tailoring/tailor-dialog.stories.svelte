<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TailorDialog from '$lib/components/tailoring/tailor-dialog.svelte';
	import { fn } from 'storybook/test';
	import type { CV, CVBlocks, ObjectId } from '$lib/types/cv';
	import { computeBlockHashes } from '$lib/features/tailoring/hash';

	const sourceBlocks: CVBlocks = {
		fullName: { objectId: 'fn-1' as unknown as ObjectId, value: 'Alex Smith' },
		position: {
			objectId: 'pos-1' as unknown as ObjectId,
			value: 'Senior Software Engineer'
		},
		location: { objectId: 'loc-1' as unknown as ObjectId, value: 'San Francisco, CA' },
		contacts: { objectId: 'cb-1' as unknown as ObjectId, value: [] },
		highlights: { objectId: 'hb-1' as unknown as ObjectId, value: [] },
		skills: { objectId: 'sb-1' as unknown as ObjectId, value: [] },
		jobHistory: { objectId: 'jb-1' as unknown as ObjectId, value: [] },
		projects: { objectId: 'pb-1' as unknown as ObjectId, value: [] },
		education: { objectId: 'eb-1' as unknown as ObjectId, value: [] }
	};
	const sourceCv: CV = {
		id: 'cv-source-1',
		name: 'Master CV',
		createdAt: Date.now() - 86400000 * 7,
		updatedAt: Date.now() - 3600000,
		blocks: sourceBlocks,
		blockHashes: computeBlockHashes(sourceBlocks),
		hiddenBlockIds: []
	};

	const { Story } = defineMeta({
		title: 'Tailoring/TailorDialog',
		component: TailorDialog,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<div class="p-8">
		<TailorDialog {sourceCv} onCreate={fn()} />
	</div>
</Story>
