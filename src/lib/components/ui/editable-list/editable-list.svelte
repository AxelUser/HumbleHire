<script lang="ts">
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		items: string[];
		placeholder?: string;
		addLabel?: string;
		class?: string;
	}

	let {
		items = $bindable(),
		placeholder = 'Add an item...',
		addLabel = 'Add Item',
		class: className
	}: Props = $props();

	function addItem() {
		items = [...items, ''];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
	{#each items as _, index (index)}
		<div class="flex items-center gap-2">
			<span class="text-lg leading-none text-muted-foreground select-none">■</span>
			<InlineTextarea
				bind:value={items[index]}
				{placeholder}
				class="flex-1"
				rows={2}
			/>
			<Button
				variant="ghost"
				size="icon"
				class="shrink-0 -mt-1 text-muted-foreground hover:text-destructive"
				onclick={() => removeItem(index)}
			>
				<Trash2 class="size-4" />
			</Button>
		</div>
	{/each}
	<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addItem}>
		<Plus class="size-4 mr-1" />
		{addLabel}
	</Button>
</div>
