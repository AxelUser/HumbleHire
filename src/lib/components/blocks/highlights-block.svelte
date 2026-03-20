<script lang="ts">
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus } from '@lucide/svelte';

	interface Props {
		highlights: string[];
		visible: boolean;
	}

	let { highlights = $bindable(), visible = $bindable() }: Props = $props();

	function addHighlight() {
		highlights = [...highlights, ''];
	}

	function removeHighlight(index: number) {
		highlights = highlights.filter((_, i) => i !== index);
	}
</script>

<BlockWrapper title="Highlights" bind:visible>
	<div class="flex flex-col gap-2">
		{#each highlights as highlight, index (index)}
			<div class="flex items-start gap-2">
				<span class="mt-[0.2rem] text-lg leading-none text-muted-foreground select-none">■</span>
				<InlineTextarea
					bind:value={highlights[index]}
					placeholder="Add a highlight..."
					class="flex-1"
					rows={2}
				/>
				<Button
					variant="ghost"
					size="icon"
					class="shrink-0 mt-1 text-muted-foreground hover:text-destructive"
					onclick={() => removeHighlight(index)}
				>
					<Trash2 class="h-4 w-4" />
				</Button>
			</div>
		{/each}
		<Button variant="outline" size="sm" class="mt-1 self-start" onclick={addHighlight}>
			<Plus class="h-4 w-4 mr-1" />
			Add Highlight
		</Button>
	</div>
</BlockWrapper>
