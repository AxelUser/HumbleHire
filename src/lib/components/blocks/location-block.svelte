<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';

	interface Props {
		value: string;
		visible: boolean;
	}

	let { value = $bindable(), visible = $bindable() }: Props = $props();
</script>

<BlockWrapper title="Location" bind:visible>
	<InlineField bind:value placeholder="City, Country" />
</BlockWrapper>
