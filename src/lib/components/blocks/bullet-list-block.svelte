<script lang="ts">
	import { EditableList } from '$lib/components/ui/editable-list';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import type { Highlight, ObjectId } from '$lib/types/cv';

	interface Props {
		highlights: Highlight[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { highlights = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();
</script>

<BlockWrapper title="Highlights" {blockId} bind:hiddenBlockIds>
	<EditableList bind:items={highlights} placeholder="Add a highlight..." addLabel="Add Highlight" />
</BlockWrapper>
