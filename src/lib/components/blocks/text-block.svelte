<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import type { Block, ObjectId } from '$lib/types/cv';
	import { cn } from '$lib/utils';

	interface Props {
		block: Block<string>;
		hiddenBlockIds: ObjectId[];
		title: string;
		placeholder: string;
		class?: string;
	}

	let {
		block = $bindable(),
		hiddenBlockIds = $bindable(),
		title,
		placeholder,
		class: className
	}: Props = $props();
</script>

<BlockWrapper {title} blockId={block.objectId} bind:hiddenBlockIds>
	<InlineField bind:value={block.value} {placeholder} class={cn(className)} />
</BlockWrapper>
