<script lang="ts">
	import JobHistoryBlock from '$lib/components/blocks/job-history-block.svelte';
	import { createObjectId } from '$lib/types/cv';
	import type { ObjectId, JobEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	const blockId = createObjectId();

	let jobs = $state<JobEntry[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						company: 'Stripe',
						role: 'Senior Software Engineer',
						startDate: new Date(Date.UTC(2021, 0, 1)),
						endDate: undefined,
						achievements: [
							{
								objectId: createObjectId(),
								text: 'Built and maintained payment processing APIs handling $10B+ annually.'
							},
							{
								objectId: createObjectId(),
								text: 'Reduced API latency by 40% through query optimization and caching.'
							}
						],
						skills: [
							{ objectId: createObjectId(), value: 'Go' },
							{ objectId: createObjectId(), value: 'Kubernetes' },
							{ objectId: createObjectId(), value: 'PostgreSQL' }
						]
					},
					{
						objectId: createObjectId(),
						company: 'Vercel',
						role: 'Software Engineer',
						startDate: new Date(Date.UTC(2019, 5, 1)),
						endDate: new Date(Date.UTC(2020, 11, 1)),
						achievements: [
							{
								objectId: createObjectId(),
								text: 'Contributed to the Edge Runtime rollout across 50+ enterprise customers.'
							},
							{
								objectId: createObjectId(),
								text: 'Improved CI/CD pipeline speed by 60% with parallelized test execution.'
							}
						],
						skills: [
							{ objectId: createObjectId(), value: 'TypeScript' },
							{ objectId: createObjectId(), value: 'React' },
							{ objectId: createObjectId(), value: 'AWS' }
						]
					}
				]
	);
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [blockId]);
</script>

<JobHistoryBlock bind:jobs {blockId} bind:hiddenBlockIds />
