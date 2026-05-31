<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import type { CVHighlights } from '$lib/features/dashboard/search.svelte';
	import { formatRelativeTime } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { TailorDialog } from '$lib/components/tailoring';
	import TailoredRow from './tailored-row.svelte';
	import HighlightedText from './highlighted-text.svelte';
	import { ExportButton } from '$lib/components/editor';
	import { Eye, Trash2, ChevronDown } from '@lucide/svelte';

	interface Props {
		master: CV;
		tailored: CV[];
		highlights?: Map<string, CVHighlights>;
		onDelete: (id: string) => void;
		onTailor: (id: string) => void;
		onSync: (updated: CV) => void;
	}

	let { master, tailored, highlights, onDelete, onTailor, onSync }: Props = $props();

	let collapsed = $state(false);
	let tailorOpen = $state(false);

	const editedRelative = $derived(formatRelativeTime(master.updatedAt));
	const myHighlights = $derived(highlights?.get(master.id));
	const hasTailored = $derived(tailored.length > 0);
	const childrenLabel = $derived(
		`${tailored.length} tailored ${tailored.length === 1 ? 'copy' : 'copies'}`
	);
</script>

<div class="border-foreground bg-card shadow-brutal border-2" data-testid="master-group">
	<!-- Master row -->
	<div
		class="flex items-center gap-4 px-[18px] py-4 {hasTailored
			? 'border-foreground border-b-2'
			: ''}"
	>
		<!-- M glyph -->
		<span
			class="bg-foreground text-card flex h-9 w-9 shrink-0 items-center justify-center font-mono text-sm font-bold"
		>
			M
		</span>

		<!-- Title block -->
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="text-lg font-extrabold tracking-tight">
				<HighlightedText text={master.name} ranges={myHighlights?.name} />
			</span>
			<span class="text-muted-foreground text-xs font-medium">
				Edited {editedRelative}
			</span>
		</div>

		<!-- Actions -->
		<div class="flex shrink-0 items-center gap-1.5">
			<Button variant="outline" size="sm" href="/cv/{master.id}">
				<Eye class="h-3.5 w-3.5" /> Open
			</Button>
			<ExportButton cv={master} variant="ghost" />
			<TailorDialog sourceCv={master} onCreate={onTailor} bind:open={tailorOpen} />
			<Button variant="ghost" size="sm" class="px-2" onclick={() => (collapsed = !collapsed)}>
				<ChevronDown
					class="h-4 w-4 transition-transform duration-150"
					style={collapsed ? 'transform: rotate(-90deg)' : ''}
				/>
			</Button>
			<Button
				variant="ghost"
				size="sm"
				class="text-muted-foreground hover:text-foreground px-2"
				aria-label="Delete CV"
				onclick={() => onDelete(master.id)}
			>
				<Trash2 class="h-3.5 w-3.5" />
			</Button>
		</div>
	</div>

	<!-- Children section -->
	{#if !collapsed}
		<div class="bg-background px-[22px] py-3.5">
			{#if hasTailored}
				<p
					class="text-muted-foreground mb-2 font-mono text-[11px] font-bold tracking-[0.05em] uppercase"
				>
					{childrenLabel}
				</p>
				<div class="flex flex-col gap-1.5">
					{#each tailored as child, i (child.id)}
						<TailoredRow
							cv={child}
							{master}
							highlights={highlights?.get(child.id)}
							isLast={i === tailored.length - 1}
							{onDelete}
							{onSync}
						/>
					{/each}
				</div>
			{:else}
				<div class="flex items-center gap-2">
					<span class="text-foreground font-mono text-sm font-bold">└──</span>
					<span class="text-muted-foreground text-xs font-medium">No tailored copies yet.</span>
					<Button
						variant="ghost"
						size="sm"
						class="text-accent h-auto px-2 py-1 text-xs underline"
						onclick={() => (tailorOpen = true)}
					>
						Start one
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>
