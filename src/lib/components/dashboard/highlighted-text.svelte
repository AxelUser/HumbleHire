<script lang="ts">
	import { splitByRanges } from './highlighted-text';

	interface Props {
		text: string;
		ranges?: ReadonlyArray<readonly [number, number]>;
		markClass?: string;
	}

	let { text, ranges, markClass = 'bg-foreground text-card px-0.5' }: Props = $props();

	const segments = $derived(splitByRanges(text, ranges));
</script>

{#each segments as seg (seg.text)}{#if seg.highlight}<mark class={markClass}>{seg.text}</mark
		>{:else}{seg.text}{/if}{/each}
