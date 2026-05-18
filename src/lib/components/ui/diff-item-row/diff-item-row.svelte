<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Check, X, RotateCcw, Plus, Minus, ArrowLeftRight } from '@lucide/svelte';
	import type { DiffViewItem } from '$lib/features/tailoring/types';

	interface Props {
		item: DiffViewItem;
		decision: 'accepted' | 'discarded' | undefined;
		onAccept: () => void;
		onDiscard: () => void;
		onRevert: () => void;
	}

	let { item, decision, onAccept, onDiscard, onRevert }: Props = $props();

	const typeIcon = $derived.by(() => {
		switch (item.type) {
			case 'entryAdded':
				return Plus;
			case 'entryRemoved':
				return Minus;
			case 'textModified':
			case 'entryModified':
		}
	});

	const typeColor = $derived.by(() => {
		switch (item.type) {
			case 'entryAdded':
				return 'text-green-600 dark:text-green-400';
			case 'entryRemoved':
				return 'text-red-600 dark:text-red-400';
			default:
				return 'text-blue-600 dark:text-blue-400';
		}
	});
</script>

<div
	class="rounded-lg border p-4 {decision === 'accepted'
		? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
		: decision === 'discarded'
			? 'border-muted bg-muted/30 opacity-60'
			: 'border-border bg-card'}"
>
	<div class="flex items-start gap-3">
		<div class="mt-0.5 shrink-0 {typeColor}">
			{#if item.type === 'entryAdded'}
				<Plus class="h-4 w-4" />
			{:else if item.type === 'entryRemoved'}
				<Minus class="h-4 w-4" />
			{:else}
				<ArrowLeftRight class="h-4 w-4" />
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					{item.blockLabel}
				</span>
				{#if item.previouslyDiscarded}
					<Badge variant="outline" class="text-xs">Previously dismissed</Badge>
				{/if}
				{#if decision === 'accepted'}
					<Badge variant="secondary" class="text-xs text-green-700 dark:text-green-400"
						>Accepted</Badge
					>
				{:else if decision === 'discarded'}
					<Badge variant="secondary" class="text-xs">Dismissed</Badge>
				{/if}
			</div>
			<p class="mt-0.5 text-sm font-medium">{item.description}</p>

			{#if item.type === 'textModified' || item.type === 'entryModified'}
				<div class="mt-2 grid grid-cols-2 gap-2 text-xs">
					{#if item.before !== undefined}
						<div class="rounded bg-red-50 p-2 dark:bg-red-950/30">
							<span class="text-muted-foreground mb-1 block font-medium">Before</span>
							<span class="text-foreground">{item.before || '(empty)'}</span>
						</div>
					{/if}
					{#if item.after !== undefined}
						<div class="rounded bg-green-50 p-2 dark:bg-green-950/30">
							<span class="text-muted-foreground mb-1 block font-medium">After</span>
							<span class="text-foreground">{item.after || '(empty)'}</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="flex shrink-0 items-center gap-1">
			{#if decision !== undefined}
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-foreground h-7 w-7"
					onclick={onRevert}
					title="Revert decision"
				>
					<RotateCcw class="h-3.5 w-3.5" />
				</Button>
			{:else}
				<Button
					variant="ghost"
					size="icon"
					class="h-7 w-7 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
					onclick={onAccept}
					title="Accept change"
				>
					<Check class="h-3.5 w-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-foreground h-7 w-7"
					onclick={onDiscard}
					title="Dismiss change"
				>
					<X class="h-3.5 w-3.5" />
				</Button>
			{/if}
		</div>
	</div>
</div>
