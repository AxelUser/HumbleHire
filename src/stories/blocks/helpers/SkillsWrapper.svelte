<script lang="ts">
	import SkillsBlock from '$lib/components/blocks/skills-block.svelte';
	import { createObjectId, type SkillCategory } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
		startWithCategories?: boolean;
	}

	let { startVisible = true, startEmpty = false, startWithCategories = false }: Props = $props();

	function mkKeywords(values: string[]) {
		return values.map((value) => ({ objectId: createObjectId(), value }));
	}

	function getInitialSkills(): SkillCategory[] {
		if (startEmpty) return [];
		if (startWithCategories) {
			return [
				{
					objectId: createObjectId(),
					name: 'Frontend',
					keywords: mkKeywords(['React', 'TypeScript', 'Svelte', 'CSS'])
				},
				{
					objectId: createObjectId(),
					name: 'Backend',
					keywords: mkKeywords(['Node.js', 'PostgreSQL', 'Redis'])
				},
				{
					objectId: createObjectId(),
					name: 'DevOps',
					keywords: mkKeywords(['Docker', 'Kubernetes', 'Terraform'])
				}
			];
		}
		return [
			{
				objectId: createObjectId(),
				name: '',
				keywords: mkKeywords(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'])
			}
		];
	}

	let skills = $state<SkillCategory[]>(getInitialSkills());
	let hidden = $state<string[]>(startVisible ? [] : ['skills/']);
</script>

<SkillsBlock bind:skills bind:hidden />
