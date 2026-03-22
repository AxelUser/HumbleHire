<script lang="ts">
	import ProjectsBlock from '$lib/components/blocks/projects-block.svelte';
	import type { ProjectEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	let projects = $state<ProjectEntry[]>(
		startEmpty
			? []
			: [
					{
						id: '1',
						name: 'OpenMetrics',
						description:
							'An open-source observability toolkit for distributed systems. Built with Go and Prometheus.',
						stack: ['Go', 'Prometheus', 'Grafana', 'Docker'],
						link: 'github.com/alexchen/openmetrics'
					},
					{
						id: '2',
						name: 'HumbleHire',
						description: 'A resume builder app with a brutalist design aesthetic.',
						stack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'Dexie'],
						link: 'humblehire.app'
					}
				]
	);
	let visible = $state(startVisible);
</script>

<ProjectsBlock bind:projects bind:visible />
