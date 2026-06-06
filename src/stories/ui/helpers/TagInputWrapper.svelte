<script lang="ts">
	import { TagInput } from '$lib/components/ui/tag-input';
	import { createObjectId, type StringEntry } from '$lib/types/cv';

	interface Props {
		startTags?: string[];
	}

	let { startTags = ['React', 'TypeScript', 'Node.js'] }: Props = $props();

	let tags = $state<StringEntry[]>(
		startTags.map((value) => ({ objectId: createObjectId(), value }))
	);
</script>

<TagInput bind:tags placeholder="Add a tag..." />
