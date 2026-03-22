<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FullNameWrapper from '../blocks/helpers/FullNameWrapper.svelte';
	import PositionWrapper from '../blocks/helpers/PositionWrapper.svelte';
	import LocationWrapper from '../blocks/helpers/LocationWrapper.svelte';
	import ContactsWrapper from '../blocks/helpers/ContactsWrapper.svelte';
	import HighlightsWrapper from '../blocks/helpers/HighlightsWrapper.svelte';
	import JobHistoryWrapper from '../blocks/helpers/JobHistoryWrapper.svelte';
	import EducationWrapper from '../blocks/helpers/EducationWrapper.svelte';
	import ProjectsWrapper from '../blocks/helpers/ProjectsWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Pages/ResumeBlocks',
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="FullResume">
	<div class="bg-background min-h-screen p-6">
		<div class="mx-auto flex max-w-3xl flex-col gap-4">
			<FullNameWrapper />
			<PositionWrapper />
			<LocationWrapper />
			<ContactsWrapper />
			<HighlightsWrapper />
			<JobHistoryWrapper />
			<EducationWrapper />
			<ProjectsWrapper />
		</div>
	</div>
</Story>
