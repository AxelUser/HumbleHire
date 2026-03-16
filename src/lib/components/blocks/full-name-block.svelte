<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';

	interface Props {
		value: string;
		visible: boolean;
	}

	let { value = $bindable(), visible = $bindable() }: Props = $props();
</script>

<BlockWrapper title="Full Name" bind:visible>
	<InlineField bind:value placeholder="Your full name" class="text-3xl font-bold" />
</BlockWrapper>
