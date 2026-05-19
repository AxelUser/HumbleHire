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

	const isAdded = $derived(item.type === 'entryAdded');
	const isRemoved = $derived(item.type === 'entryRemoved');

	const typeColor = $derived(
		isAdded
			? 'text-green-600 dark:text-green-400'
			: isRemoved
				? 'text-red-600 dark:text-red-400'
				: 'text-blue-600 dark:text-blue-400'
	);
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
			{#if isAdded}
				<Plus class="h-4 w-4" />
			{:else if isRemoved}
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

			{#if item.preview}
				{@const p = item.preview}
				<div
					class="mt-2 rounded border p-3 text-sm {isAdded
						? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
						: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'}"
				>
					<p class="text-foreground font-medium">{p.title}</p>
					{#if p.subtitle}
						<p class="text-muted-foreground mt-0.5 text-xs">{p.subtitle}</p>
					{/if}
					{#if p.bullets && p.bullets.length > 0}
						<ul class="text-foreground mt-2 list-disc space-y-0.5 pl-4 text-xs">
							{#each p.bullets as bullet, i (i)}
								<li>{bullet}</li>
							{/each}
						</ul>
					{/if}
					{#if p.tags && p.tags.length > 0}
						<div class="mt-2 flex flex-wrap gap-1">
							{#each p.tags as tag, i (i)}
								<Badge variant="secondary" class="text-xs">{tag}</Badge>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			{#if item.fields && item.fields.length > 0}
				<div class="mt-2 flex flex-col gap-2">
					{#each item.fields as field (field.label)}
						<div>
							<span class="text-muted-foreground text-xs font-medium">{field.label}</span>
							<div class="mt-1 grid grid-cols-2 gap-2 text-xs">
								<div class="rounded bg-red-50 p-2 dark:bg-red-950/30">
									<span class="text-muted-foreground mb-1 block font-medium">Before</span>
									<span class="text-foreground">{field.before}</span>
								</div>
								<div class="rounded bg-green-50 p-2 dark:bg-green-950/30">
									<span class="text-muted-foreground mb-1 block font-medium">After</span>
									<span class="text-foreground">{field.after}</span>
								</div>
							</div>
						</div>
					{/each}
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
