<script lang="ts">
	import EducationBlock from '$lib/components/blocks/education-block.svelte';
	import { createObjectId, type EducationEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	let education = $state<EducationEntry[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						institution: 'MIT',
						studyType: 'BSc',
						area: 'Computer Science',
						startDate: new Date(Date.UTC(2014, 8, 1)),
						endDate: new Date(Date.UTC(2017, 5, 1)),
						current: false,
						courses: []
					}
				]
	);
	let hidden = $state<string[]>(startVisible ? [] : ['education/']);
</script>

<EducationBlock bind:education bind:hidden />
