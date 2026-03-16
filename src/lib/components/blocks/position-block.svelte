<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';

	interface Props {
		value: string;
		visible: boolean;
	}

	let { value = $bindable(), visible = $bindable() }: Props = $props();
</script>

<BlockWrapper title="Position" bind:visible>
	<InlineField bind:value placeholder="Your position / job title" class="text-xl text-muted-foreground" />
</BlockWrapper>
