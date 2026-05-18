<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TailorDialog from '$lib/components/tailoring/tailor-dialog.svelte';
	import TailorDialogWrapper from './helpers/TailorDialogWrapper.svelte';
	import { fn } from 'storybook/test';
	import type { CV, ObjectId } from '$lib/types/cv';

	const sourceCv: CV = {
		id: 'cv-source-1',
		name: 'Master CV',
		notes: '',
		version: 3,
		createdAt: Date.now() - 86400000 * 7,
		updatedAt: Date.now() - 3600000,
		blocks: {
			fullName: { objectId: 'fn-1' as unknown as ObjectId, value: 'Alex Smith' },
			position: {
				objectId: 'pos-1' as unknown as ObjectId,
				value: 'Senior Software Engineer'
			},
			location: { objectId: 'loc-1' as unknown as ObjectId, value: 'San Francisco, CA' },
			contactsBlockId: 'cb-1' as unknown as ObjectId,
			contacts: [],
			highlightsBlockId: 'hb-1' as unknown as ObjectId,
			highlights: [],
			skillsBlockId: 'sb-1' as unknown as ObjectId,
			skills: [],
			jobHistoryBlockId: 'jb-1' as unknown as ObjectId,
			jobHistory: [],
			projectsBlockId: 'pb-1' as unknown as ObjectId,
			projects: [],
			educationBlockId: 'eb-1' as unknown as ObjectId,
			education: []
		},
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
