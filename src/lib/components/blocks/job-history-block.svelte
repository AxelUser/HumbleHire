<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { DatePickerField } from '$lib/components/ui/date-picker';
	import { EditableList } from '$lib/components/ui/editable-list';
	import { TagInput } from '$lib/components/ui/tag-input';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { SegmentedControl, SegmentedControlItem } from '$lib/components/ui/segmented-control';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import type { JobEntry, ObjectId } from '$lib/types/cv';
	import { createObjectId } from '$lib/types/cv';

	interface Props {
		jobs: JobEntry[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { jobs = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();

	function addJob() {
		jobs = [
			...jobs,
			{
				objectId: createObjectId(),
				company: '',
				role: '',
				startDate: undefined,
				endDate: undefined,
				current: false,
				achievements: [],
				skills: []
			}
		];
	}

	function removeJob(objectId: ObjectId) {
		jobs = jobs.filter((j) => j.objectId !== objectId);
	}

	function onDragOver(event: any) {
		jobs = move(jobs as any, event) as JobEntry[];
	}

	function onDragEnd(event: any) {
		jobs = move(jobs as any, event) as JobEntry[];
	}
</script>

<BlockWrapper title="Job History" {blockId} bind:hiddenBlockIds>
	<DragDropProvider {onDragEnd} {onDragOver}>
		<div class="flex flex-col gap-4">
			{#each jobs as job, index (job.objectId)}
				{@const sortable = createSortable({ id: job.objectId, index: (() => index) as any })}
				<div
					class="relative rounded-lg p-4 {sortable.isDragging
						? 'border-muted border-2 border-dashed'
						: 'border'} {job.current && !sortable.isDragging
						? 'pl-[18px] shadow-[inset_4px_0_0_0_var(--accent)]'
						: ''}"
					{@attach sortable.attach}
				>
					<div class="flex flex-col gap-2 {sortable.isDragging ? 'invisible' : ''}">
						<div class="flex items-center justify-between gap-2">
							<span
								{@attach sortable.attachHandle}
								class="text-muted-foreground shrink-0 cursor-grab"
							>
								<GripVertical class="h-4 w-4" />
							</span>
							<div class="flex flex-1 flex-wrap items-baseline gap-2">
								<InlineField bind:value={job.company} placeholder="Company" class="font-semibold" />
								<span class="text-muted-foreground">—</span>
								<InlineField bind:value={job.role} placeholder="Role" class="flex-1" />
							</div>
							<Button
								variant="ghost"
								size="icon"
								class="text-muted-foreground hover:text-destructive shrink-0"
								onclick={() => removeJob(job.objectId)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<DatePickerField bind:value={job.startDate} placeholder="Start date" />
							<span class="text-muted-foreground">—</span>
							{#if job.current}
								<span class="text-muted-foreground font-mono font-bold tracking-wider uppercase">
									Present
								</span>
							{:else}
								<DatePickerField bind:value={job.endDate} placeholder="End date" />
							{/if}
							<SegmentedControl
								bind:value={job.current}
								aria-label="Occupation status"
								class="ml-auto font-mono tracking-wider uppercase"
							>
								<SegmentedControlItem value={false} aria-label="Past role">Past</SegmentedControlItem>
								<SegmentedControlItem value={true} aria-label="Current role">Current</SegmentedControlItem>
							</SegmentedControl>
						</div>
						<EditableList
							bind:items={job.achievements}
							placeholder="Describe an achievement..."
							addLabel="Add Achievement"
						/>
						<TagInput bind:tags={job.skills} placeholder="Add skill (e.g. React, AWS)" />
					</div>
				</div>
			{/each}
			<Button variant="outline" size="sm" class="self-start" onclick={addJob}>
				<Plus class="mr-1 h-4 w-4" />
				Add Job
			</Button>
		</div>
		<DragOverlay>
			{#snippet children(source: any)}
				{@const job = jobs.find((j) => j.objectId === source.id)}
				{#if job}
					<div class="bg-background rounded-lg border p-4 shadow-lg">
						<div class="flex items-start gap-2">
							<GripVertical class="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
							<div class="flex flex-wrap items-baseline gap-2">
								<span class="text-sm font-semibold">{job.company || 'Company'}</span>
								<span class="text-muted-foreground">—</span>
								<span class="text-sm">{job.role || 'Role'}</span>
							</div>
						</div>
					</div>
				{/if}
			{/snippet}
		</DragOverlay>
	</DragDropProvider>
</BlockWrapper>
