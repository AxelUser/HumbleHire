<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import type { CVHighlights } from '$lib/features/dashboard/search.svelte';
	import { hasUpdatesAvailable } from '$lib/features/tailoring/detection';
	import { formatRelativeTime } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { SyncDrawer } from '$lib/components/tailoring';
	import StatusBadge from './status-badge.svelte';
	import HighlightedText from './highlighted-text.svelte';
	import { ExportButton } from '$lib/components/editor';
	import { Eye, Trash2 } from '@lucide/svelte';

	interface Props {
		cv: CV;
		master: CV;
		highlights?: CVHighlights;
		isLast: boolean;
		onDelete: (id: string) => void;
		onSync: (updated: CV) => void;
	}

	let { cv, master, highlights, isLast, onDelete, onSync }: Props = $props();

	const updatesAvailable = $derived(hasUpdatesAvailable(master, cv));
	const targetText = $derived(cv.company ?? cv.name);
	const subtitleText = $derived(cv.company ? cv.name : '');
	const targetRanges = $derived(cv.company ? highlights?.company : highlights?.name);
	const subtitleRanges = $derived(cv.company ? highlights?.name : undefined);
	const tailoredDate = $derived(
		new Date(cv.createdAt).toLocaleDateString('en-US', {
			month: 'numeric',
			day: 'numeric',
			year: 'numeric'
		})
	);
	const editedRelative = $derived(formatRelativeTime(cv.updatedAt));
</script>

<div class="flex items-stretch gap-0">
	<!-- ASCII connector -->
	<span
		class="text-foreground pt-3.5 pr-2 font-mono text-sm leading-snug font-bold select-none"
		style="min-width:22px"
	>
		{isLast ? '└──' : '├──'}
	</span>

	<!-- Row card -->
	<div
		class="border-foreground bg-card shadow-brutal-sm flex flex-1 items-center gap-3.5 border-2 px-3.5 py-2.5"
	>
		<!-- T glyph -->
		<span
			class="bg-accent flex h-[26px] w-[26px] shrink-0 items-center justify-center font-mono text-xs font-bold text-white"
		>
			T
		</span>

		<!-- Title stack -->
		<div class="flex min-w-0 flex-col gap-0.5">
			<div class="flex flex-wrap items-baseline gap-x-1 text-sm">
				<strong class="font-bold">
					<HighlightedText text={targetText} ranges={targetRanges} />
				</strong>
				{#if subtitleText}
					<span class="text-muted-foreground font-medium">
						· <HighlightedText text={subtitleText} ranges={subtitleRanges} />
					</span>
				{/if}
			</div>
			<div
				class="text-muted-foreground flex flex-wrap items-center gap-x-1 text-[11px] font-medium"
			>
				<span>Tailored {tailoredDate}</span>
				<span>·</span>
				<span>edited {editedRelative}</span>
			</div>
		</div>

		<span class="flex-1"></span>

		<!-- Status badge -->
		<StatusBadge {updatesAvailable} />

		<!-- Actions -->
		<div class="flex shrink-0 items-center gap-1.5">
			{#if updatesAvailable}
				<SyncDrawer masterCv={master} tailoredCv={cv} {onSync} />
			{/if}
			<Button variant="outline" size="sm" href="/cv/{cv.id}">
				<Eye class="h-3.5 w-3.5" /> Open
			</Button>
			<ExportButton {cv} variant="ghost" />
			<Button
				variant="ghost"
				size="sm"
				class="text-muted-foreground hover:text-foreground px-2"
				onclick={() => onDelete(cv.id)}
			>
				<Trash2 class="h-3.5 w-3.5" />
			</Button>
		</div>
	</div>
</div>
