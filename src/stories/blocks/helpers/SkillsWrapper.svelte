<script lang="ts">
	import SkillsBlock from '$lib/components/blocks/skills-block.svelte';
	import type { SkillCategory } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
		startWithCategories?: boolean;
	}

	let { startVisible = true, startEmpty = false, startWithCategories = false }: Props = $props();

	function getInitialSkills(): SkillCategory[] {
		if (startEmpty) return [];
		if (startWithCategories) {
			return [
				{
					id: '1',
					name: 'Frontend',
					skills: ['React', 'TypeScript', 'Svelte', 'CSS']
				},
				{
					id: '2',
					name: 'Backend',
					skills: ['Node.js', 'PostgreSQL', 'Redis']
				},
				{
					id: '3',
					name: 'DevOps',
					skills: ['Docker', 'Kubernetes', 'Terraform']
				}
			];
		}
		return [
			{
				id: '1',
				name: '',
				skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']
			}
		];
	}

	let skills = $state<SkillCategory[]>(getInitialSkills());
	let visible = $state(startVisible);
</script>

<SkillsBlock bind:skills bind:visible />
