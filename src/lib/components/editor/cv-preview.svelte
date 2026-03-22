<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import {
		FullNameBlock,
		PositionBlock,
		LocationBlock,
		ContactsBlock,
		HighlightsBlock,
		JobHistoryBlock,
		ProjectsBlock,
		EducationBlock
	} from '$lib/components/blocks';

	interface Props {
		cv: CV;
	}

	let { cv = $bindable() }: Props = $props();
</script>

<div class="mx-auto max-w-3xl space-y-4 px-6 py-8">
	<FullNameBlock bind:value={cv.blocks.fullName} bind:visible={cv.blockVisibility.fullName} />
	<PositionBlock bind:value={cv.blocks.position} bind:visible={cv.blockVisibility.position} />
	<LocationBlock bind:value={cv.blocks.location} bind:visible={cv.blockVisibility.location} />
	<ContactsBlock bind:contacts={cv.blocks.contacts} bind:visible={cv.blockVisibility.contacts} />
	<HighlightsBlock
		bind:highlights={cv.blocks.highlights}
		bind:visible={cv.blockVisibility.highlights}
	/>
	<JobHistoryBlock bind:jobs={cv.blocks.jobHistory} bind:visible={cv.blockVisibility.jobHistory} />
	<ProjectsBlock bind:projects={cv.blocks.projects} bind:visible={cv.blockVisibility.projects} />
	<EducationBlock
		bind:education={cv.blocks.education}
		bind:visible={cv.blockVisibility.education}
	/>
</div>
