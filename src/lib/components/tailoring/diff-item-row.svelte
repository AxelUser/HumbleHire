<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Check, X, RotateCcw, Plus, Minus, ArrowLeftRight } from '@lucide/svelte';
	import type { CV } from '$lib/types/cv';
	import type { DiffItem } from '$lib/features/tailoring/types';
	import { describeDiff, formatValue } from '$lib/features/tailoring/present';
	import DiffFieldGrid from './diff/diff-field-grid.svelte';

	interface Props {
		item: DiffItem;
		masterCv: CV;
		tailoredCv: CV;
		decision: 'accepted' | 'discarded' | undefined;
		onAccept: () => void;
		onDiscard: () => void;
		onRevert: () => void;
	}

	let { item, masterCv, tailoredCv, decision, onAccept, onDiscard, onRevert }: Props = $props();

	const meta = $derived(describeDiff(item, masterCv, tailoredCv));
	const breadcrumb = $derived(meta.breadcrumb.join(' › '));

	// A modified item ends at a scalar, so show its before/after; added/removed speak for themselves.
	const fields = $derived(
		item.change === 'modified'
			? [
					{
						label: meta.breadcrumb[meta.breadcrumb.length - 1] ?? meta.description,
						before: formatValue(item.before),
						after: formatValue(item.after)
					}
				]
			: null
	);
</script>

<div
	class="rounded-lg border p-4 {decision === 'accepted'
		? 'border-accent bg-accent/10'
		: decision === 'discarded'
			? 'border-muted bg-muted/30 opacity-60'
			: 'border-border bg-card'}"
>
	<div class="flex items-start gap-3">
		<div
			class="mt-0.5 shrink-0 {meta.change === 'added'
				? 'text-accent'
				: meta.change === 'removed'
					? 'text-destructive'
					: 'text-muted-foreground'}"
		>
			{#if meta.change === 'added'}
				<Plus class="h-4 w-4" />
			{:else if meta.change === 'removed'}
				<Minus class="h-4 w-4" />
			{:else}
				<ArrowLeftRight class="h-4 w-4" />
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			{#if decision !== undefined}
				<div class="mb-1 flex flex-wrap items-center gap-2">
					{#if decision === 'accepted'}
						<Badge variant="secondary" class="text-accent text-xs">Accepted</Badge>
					{:else if decision === 'discarded'}
						<Badge variant="secondary" class="text-xs">Dismissed</Badge>
					{/if}
				</div>
			{/if}

			<p class="mt-0.5 text-sm font-medium">{breadcrumb}</p>
			<p class="text-muted-foreground text-xs">{meta.description}</p>

			{#if fields}
				<DiffFieldGrid {fields} />
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
					class="text-accent hover:bg-muted hover:text-accent h-7 w-7"
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
