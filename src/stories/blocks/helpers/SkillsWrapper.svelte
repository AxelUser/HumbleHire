<script lang="ts">
	import SkillsBlock from '$lib/components/blocks/skills-block.svelte';
	import { createObjectId, type ObjectId, type SkillCategory } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
		startWithCategories?: boolean;
	}

	let { startVisible = true, startEmpty = false, startWithCategories = false }: Props = $props();

	const blockId = createObjectId();

	function mkTags(values: string[]) {
		return values.map((value) => ({ objectId: createObjectId(), value }));
	}

	function getInitialSkills(): SkillCategory[] {
		if (startEmpty) return [];
		if (startWithCategories) {
			return [
				{
					objectId: createObjectId(),
					name: 'Frontend',
					skills: mkTags(['React', 'TypeScript', 'Svelte', 'CSS'])
				},
				{
					objectId: createObjectId(),
					name: 'Backend',
					skills: mkTags(['Node.js', 'PostgreSQL', 'Redis'])
				},
				{
					objectId: createObjectId(),
					name: 'DevOps',
					skills: mkTags(['Docker', 'Kubernetes', 'Terraform'])
				}
			];
		}
		return [
			{
				objectId: createObjectId(),
				name: '',
				skills: mkTags(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'])
			}
		];
	}

	let skills = $state<SkillCategory[]>(getInitialSkills());
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [blockId]);
</script>

<SkillsBlock bind:skills {blockId} bind:hiddenBlockIds />
