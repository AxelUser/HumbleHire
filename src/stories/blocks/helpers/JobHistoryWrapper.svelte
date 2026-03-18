<script lang="ts">
	import JobHistoryBlock from '$lib/components/blocks/job-history-block.svelte';
	import type { JobEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	let jobs = $state<JobEntry[]>(
		startEmpty
			? []
			: [
					{
						id: '1',
						company: 'Stripe',
						role: 'Senior Software Engineer',
						startDate: 'Jan 2021',
						endDate: 'Present',
						achievements: [
							'Built and maintained payment processing APIs handling $10B+ annually.',
							'Reduced API latency by 40% through query optimization and caching.'
						]
					},
					{
						id: '2',
						company: 'Vercel',
						role: 'Software Engineer',
						startDate: 'Jun 2019',
						endDate: 'Dec 2020',
						achievements: [
							'Contributed to the Edge Runtime rollout across 50+ enterprise customers.',
							'Improved CI/CD pipeline speed by 60% with parallelized test execution.'
						]
					}
				]
	);
	let visible = $state(startVisible);
</script>

<JobHistoryBlock bind:jobs bind:visible />
