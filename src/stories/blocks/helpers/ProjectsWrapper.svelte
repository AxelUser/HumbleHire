<script lang="ts">
	import ProjectsBlock from '$lib/components/blocks/projects-block.svelte';
	import { APP_BASE_URL } from '$lib/config';
	import { createObjectId, type ProjectEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	function mkKeywords(values: string[]) {
		return values.map((value) => ({ objectId: createObjectId(), value }));
	}

	let projects = $state<ProjectEntry[]>(
		startEmpty
			? []
			: [
					{
						objectId: createObjectId(),
						name: 'OpenMetrics',
						description:
							'An open-source observability toolkit for distributed systems. Built with Go and Prometheus.',
						current: false,
						highlights: [],
						keywords: mkKeywords(['Go', 'Prometheus', 'Grafana', 'Docker']),
						roles: [],
						url: 'github.com/alexchen/openmetrics'
					},
					{
						objectId: createObjectId(),
						name: 'HumbleHire',
						description: 'A resume builder app with a brutalist design aesthetic.',
						current: false,
						highlights: [],
						keywords: mkKeywords(['SvelteKit', 'TypeScript', 'Tailwind CSS', 'Dexie']),
						roles: [],
						url: APP_BASE_URL
					}
				]
	);
	let hidden = $state<string[]>(startVisible ? [] : ['projects/']);
</script>

<ProjectsBlock bind:projects bind:hidden />
