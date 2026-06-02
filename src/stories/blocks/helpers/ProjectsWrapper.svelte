<script lang="ts">
	import ProjectsBlock from '$lib/components/blocks/projects-block.svelte';
	import { createObjectId, type ObjectId, type ProjectEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	const blockId = createObjectId();

	let projects = $state<ProjectEntry[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						name: 'OpenMetrics',
						description:
							'An open-source observability toolkit for distributed systems. Built with Go and Prometheus.',
						stack: [
							{ objectId: createObjectId(), value: 'Go' },
							{ objectId: createObjectId(), value: 'Prometheus' },
							{ objectId: createObjectId(), value: 'Grafana' },
							{ objectId: createObjectId(), value: 'Docker' }
						],
						link: 'github.com/alexchen/openmetrics'
					},
					{
						objectId: createObjectId(),
						name: 'HumbleHire',
						description: 'A resume builder app with a brutalist design aesthetic.',
						stack: [
							{ objectId: createObjectId(), value: 'SvelteKit' },
							{ objectId: createObjectId(), value: 'TypeScript' },
							{ objectId: createObjectId(), value: 'Tailwind CSS' },
							{ objectId: createObjectId(), value: 'Dexie' }
						],
						link: 'humblehire.app'
					}
				]
	);
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [blockId]);
</script>

<ProjectsBlock bind:projects {blockId} bind:hiddenBlockIds />
