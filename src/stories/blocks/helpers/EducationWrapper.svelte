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
						startDate: new Date(Date.UTC(2014, 8, 1)),
						endDate: new Date(Date.UTC(2017, 5, 1))
					}
				]
	);
	let visible = $state(startVisible);
</script>

<EducationBlock bind:education bind:visible />
