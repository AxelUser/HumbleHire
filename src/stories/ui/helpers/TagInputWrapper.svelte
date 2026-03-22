<script lang="ts">
	import { TagInput } from '$lib/components/ui/tag-input';

	interface Props {
		startTags?: string[];
	}

	let { startTags = ['React', 'TypeScript', 'Node.js'] }: Props = $props();

	let tags = $state<string[]>(startTags);
</script>

<TagInput bind:tags placeholder="Add a tag..." />
