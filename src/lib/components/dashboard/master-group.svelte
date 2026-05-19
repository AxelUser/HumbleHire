<script lang="ts">
	import { browser } from '$app/environment';
	import type { CV } from '$lib/types/cv';
	import { formatRelativeTime } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { TailorDialog } from '$lib/components/tailoring';
	import TailoredRow from './tailored-row.svelte';
	import { Eye, Trash2, ChevronDown } from '@lucide/svelte';

	interface Props {
		master: CV;
		tailored: CV[];
		onDelete: (id: string) => void;
		onTailor: (id: string) => void;
		onSync: (updated: CV) => void;
	}

	let { master, tailored, onDelete, onTailor, onSync }: Props = $props();

	const collapseKey = $derived(`dashboard:collapsed:${master.id}`);
	let collapsed = $state(browser ? localStorage.getItem(collapseKey) === 'true' : false);
	let tailorOpen = $state(false);

	$effect(() => {
		if (browser) localStorage.setItem(collapseKey, String(collapsed));
	});

	function countBlocks(cv: CV): number {
		const { blocks, hiddenBlockIds } = cv;
		const hiddenSet = new Set(hiddenBlockIds);
		let count = 0;
		if (blocks.fullName.value && !hiddenSet.has(blocks.fullName.objectId)) count++;
		if (blocks.position.value && !hiddenSet.has(blocks.position.objectId)) count++;
		if (blocks.location.value && !hiddenSet.has(blocks.location.objectId)) count++;
		if (!hiddenSet.has(blocks.contactsBlockId)) count += blocks.contacts.length;
		if (!hiddenSet.has(blocks.highlightsBlockId)) count += blocks.highlights.length;
		if (!hiddenSet.has(blocks.skillsBlockId)) count += blocks.skills.length;
		if (!hiddenSet.has(blocks.jobHistoryBlockId)) count += blocks.jobHistory.length;
		if (!hiddenSet.has(blocks.projectsBlockId)) count += blocks.projects.length;
		if (!hiddenSet.has(blocks.educationBlockId)) count += blocks.education.length;
		return count;
	}

	const blockCount = $derived(countBlocks(master));
	const editedRelative = $derived(formatRelativeTime(master.updatedAt));
	const hasTailored = $derived(tailored.length > 0);
	const childrenLabel = $derived(
		`${tailored.length} tailored ${tailored.length === 1 ? 'copy' : 'copies'}`
	);
</script>

<div class="border-foreground bg-card shadow-brutal border-2">
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
			<span class="text-lg font-extrabold tracking-tight">{master.name}</span>
			<span class="text-muted-foreground text-xs font-medium">
				{blockCount}
				{blockCount === 1 ? 'block' : 'blocks'} · edited {editedRelative}
			</span>
		</div>

		<!-- Actions -->
		<div class="flex shrink-0 items-center gap-1.5">
			<Button variant="outline" size="sm" href="/cv/{master.id}">
				<Eye class="h-3.5 w-3.5" /> Open
			</Button>
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
