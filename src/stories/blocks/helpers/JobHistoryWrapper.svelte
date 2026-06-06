<script lang="ts">
	import JobHistoryBlock from '$lib/components/blocks/job-history-block.svelte';
	import { createObjectId, type WorkEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	function mkKeywords(values: string[]) {
		return values.map((value) => ({ objectId: createObjectId(), value }));
	}

	let jobs = $state<WorkEntry[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						name: 'Stripe',
						position: 'Senior Software Engineer',
						startDate: new Date(Date.UTC(2021, 0, 1)),
						endDate: undefined,
						current: true,
						highlights: [
							{
								objectId: createObjectId(),
								value: 'Built and maintained payment processing APIs handling $10B+ annually.'
							},
							{
								objectId: createObjectId(),
								value: 'Reduced API latency by 40% through query optimization and caching.'
							}
						],
						keywords: mkKeywords(['Go', 'Kubernetes', 'PostgreSQL'])
					},
					{
						objectId: createObjectId(),
						name: 'Vercel',
						position: 'Software Engineer',
						startDate: new Date(Date.UTC(2019, 5, 1)),
						endDate: new Date(Date.UTC(2020, 11, 1)),
						current: false,
						highlights: [
							{
								objectId: createObjectId(),
								value: 'Contributed to the Edge Runtime rollout across 50+ enterprise customers.'
							},
							{
								objectId: createObjectId(),
								value: 'Improved CI/CD pipeline speed by 60% with parallelized test execution.'
							}
						],
						keywords: mkKeywords(['TypeScript', 'React', 'AWS'])
					}
				]
	);
	let hidden = $state<string[]>(startVisible ? [] : ['work/']);
</script>

<JobHistoryBlock bind:jobs bind:hidden />
