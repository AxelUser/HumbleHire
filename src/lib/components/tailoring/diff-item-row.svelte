<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Check, X, RotateCcw, Plus, Minus, ArrowLeftRight } from '@lucide/svelte';
	import type {
		Achievement,
		ContactEntry,
		CV,
		EducationEntry,
		Highlight,
		JobEntry,
		ProjectEntry,
		SkillCategory,
		Tag
	} from '$lib/types/cv';
	import type { DiffItem } from '$lib/features/tailoring/types';
	import { describeDiff, entryKind, formatValue } from '$lib/features/tailoring/present';
	import { resolveDiffEntry } from '$lib/features/tailoring/locate';
	import { FIELD_LABELS } from '$lib/features/tailoring/types';
	import DiffFieldGrid from './diff/diff-field-grid.svelte';
	import JobPreview from './diff/job-preview.svelte';
	import ProjectPreview from './diff/project-preview.svelte';
	import SkillCategoryPreview from './diff/skill-category-preview.svelte';
	import EducationPreview from './diff/education-preview.svelte';
	import ContactPreview from './diff/contact-preview.svelte';
	import HighlightPreview from './diff/highlight-preview.svelte';
	import AchievementPreview from './diff/achievement-preview.svelte';
	import TagPreview from './diff/tag-preview.svelte';

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

	const kind = $derived(
		item.kind === 'text'
			? undefined
			: item.kind === 'nested'
				? entryKind(item.blockKey, item.nestedListKey)
				: entryKind(item.blockKey)
	);

	const resolvedEntry = $derived(resolveDiffEntry(item, masterCv, tailoredCv));

	// Fields for text and modified items
	const fields = $derived.by(() => {
		if (item.kind === 'text') {
			return [
				{
					label: meta.blockLabel,
					before: item.before || '(empty)',
					after: item.after || '(empty)'
				}
			];
		}
		if (item.change === 'modified') {
			return Object.keys(item.after).map((key) => ({
				label: FIELD_LABELS[key] ?? key,
				before: formatValue(item.before[key]),
				after: formatValue(item.after[key])
			}));
		}
		return null;
	});

	// Show a colored preview box for added/removed entries (not for modified or text)
	const showPreview = $derived(
		meta.change !== 'modified' && item.kind !== 'text' && resolvedEntry !== undefined
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

			{#if item.kind !== 'text'}
				<p class="mt-0.5 text-sm font-medium">{meta.title}</p>
				<p class="text-muted-foreground text-xs">{meta.description}</p>
			{:else}
				<p class="mt-0.5 text-sm font-medium">{meta.description}</p>
			{/if}

			{#if showPreview && resolvedEntry}
				<div
					class="mt-2 rounded-lg border p-3 text-sm {meta.change === 'added'
						? 'border-accent bg-accent/10'
						: 'border-destructive bg-destructive/10'}"
				>
					{#if kind === 'job'}
						<JobPreview entry={resolvedEntry as JobEntry} />
					{:else if kind === 'project'}
						<ProjectPreview entry={resolvedEntry as ProjectEntry} />
					{:else if kind === 'skillCategory'}
						<SkillCategoryPreview entry={resolvedEntry as SkillCategory} />
					{:else if kind === 'education'}
						<EducationPreview entry={resolvedEntry as EducationEntry} />
					{:else if kind === 'contact'}
						<ContactPreview entry={resolvedEntry as ContactEntry} />
					{:else if kind === 'highlight'}
						<HighlightPreview entry={resolvedEntry as Highlight} />
					{:else if kind === 'achievement'}
						<AchievementPreview entry={resolvedEntry as Achievement} />
					{:else if kind === 'tag'}
						<TagPreview entry={resolvedEntry as Tag} />
					{/if}
				</div>
			{/if}

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
