<script lang="ts">
	import EducationBlock from '$lib/components/blocks/education-block.svelte';
	import type { EducationEntry } from '$lib/types/cv';

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
						id: '1',
						institution: 'MIT',
						degree: 'BSc Computer Science',
						startDate: 'Sep 2014',
						endDate: 'Jun 2017'
					}
				]
	);
	let visible = $state(startVisible);
</script>

<EducationBlock bind:education bind:visible />
