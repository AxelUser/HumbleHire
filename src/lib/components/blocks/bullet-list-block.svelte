<script lang="ts">
	import { EditableList } from '$lib/components/ui/editable-list';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import type { StringEntry } from '$lib/types/cv';

	interface Props {
		highlights: StringEntry[];
		hidden: string[];
	}

	let { highlights = $bindable(), hidden = $bindable() }: Props = $props();
</script>

<BlockWrapper title="Highlights" path="basics/highlights/" bind:hidden>
	<EditableList bind:items={highlights} placeholder="Add a highlight..." addLabel="Add Highlight" />
</BlockWrapper>
