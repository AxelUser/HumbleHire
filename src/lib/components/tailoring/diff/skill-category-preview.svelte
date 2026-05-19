<script lang="ts">
	import type { SkillCategory } from '$lib/types/cv';
	import TagList from './tag-list.svelte';

	interface Props {
		entry: SkillCategory;
	}

	let { entry }: Props = $props();
</script>

<TagList tags={entry.skills.map((s) => s.value)} />
