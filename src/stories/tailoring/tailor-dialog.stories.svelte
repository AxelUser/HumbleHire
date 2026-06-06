<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TailorDialog from '$lib/components/tailoring/tailor-dialog.svelte';
	import { fn } from 'storybook/test';
	import type { CV, CVContent } from '$lib/types/cv';
	import { computeHashes } from '$lib/features/tailoring/hash';
	import { emptyContent } from '$lib/services/cv/create';

	function mkContent(): CVContent {
		const content = emptyContent();
		content.basics.fullName = 'Alex Smith';
		content.basics.position = 'Senior Software Engineer';
		content.basics.location = 'San Francisco, CA';
		return content;
	}

	const sourceContent = mkContent();
	const sourceCv: CV = {
		id: 'cv-source-1',
		name: 'Master CV',
		createdAt: Date.now() - 86400000 * 7,
		updatedAt: Date.now() - 3600000,
		content: sourceContent,
		hashes: computeHashes(sourceContent),
		hidden: []
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
