<script lang="ts">
	import EducationBlock from '$lib/components/blocks/education-block.svelte';
	import { createObjectId } from '$lib/types/cv';
	import type { ObjectId, EducationEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	const blockId = createObjectId();

	let education = $state<EducationEntry[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						institution: 'MIT',
						degree: 'BSc Computer Science',
						startDate: new Date(Date.UTC(2014, 8, 1)),
						endDate: new Date(Date.UTC(2017, 5, 1))
					}
				]
	);
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [blockId]);
</script>

<EducationBlock bind:education {blockId} bind:hiddenBlockIds />
