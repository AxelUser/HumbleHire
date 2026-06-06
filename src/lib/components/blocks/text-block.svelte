<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { cn } from '$lib/utils';

	interface Props {
		value: string;
		hidden: string[];
		path: string;
		title: string;
		placeholder: string;
		class?: string;
	}

	let {
		value = $bindable(),
		hidden = $bindable(),
		path,
		title,
		placeholder,
		class: className
	}: Props = $props();
</script>

<BlockWrapper {title} {path} bind:hidden>
	<InlineField bind:value {placeholder} class={cn(className)} />
</BlockWrapper>
