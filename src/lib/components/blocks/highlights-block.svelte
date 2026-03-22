<script lang="ts">
	import { EditableList } from '$lib/components/ui/editable-list';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';

	interface Props {
		highlights: string[];
		visible: boolean;
	}

	let { highlights = $bindable(), visible = $bindable() }: Props = $props();
</script>

<BlockWrapper title="Highlights" bind:visible>
	<EditableList bind:items={highlights} placeholder="Add a highlight..." addLabel="Add Highlight" />
</BlockWrapper>
