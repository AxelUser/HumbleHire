<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { DatePickerField } from '$lib/components/ui/date-picker';
	import { EditableList } from '$lib/components/ui/editable-list';
	import { TagInput } from '$lib/components/ui/tag-input';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { SegmentedControl, SegmentedControlItem } from '$lib/components/ui/segmented-control';
	import { SortableItem, createSortableDragHandlers } from '$lib/components/ui/sortable';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import type { JobEntry, ObjectId } from '$lib/types/cv';
	import { createObjectId } from '$lib/types/cv';

	interface Props {
		jobs: JobEntry[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { jobs = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();

	const drag = createSortableDragHandlers(
		() => jobs,
		(items) => {
			jobs = items;
		}
	);

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
</script>

<BlockWrapper title="Job History" {blockId} bind:hiddenBlockIds>
	<DragDropProvider {...drag}>
		<div class="flex flex-col gap-4">
			{#each jobs as job, index (job.objectId)}
				<SortableItem
					id={job.objectId}
					{index}
					class="relative rounded-lg p-4"
					idleClass={job.current ? 'pl-[18px] shadow-[inset_4px_0_0_0_var(--accent)]' : undefined}
					data-testid="job-entry"
				>
					{#snippet children({ attachHandle, isDragging })}
						<div class="flex flex-col gap-2 {isDragging ? 'invisible' : ''}">
							<div class="flex items-center justify-between gap-2">
								<span
									{@attach attachHandle}
									class="text-muted-foreground shrink-0 cursor-grab"
									data-testid="drag-handle"
								>
									<GripVertical class="h-4 w-4" />
								</span>
								<div class="flex flex-1 flex-wrap items-baseline gap-2">
									<InlineField
										bind:value={job.company}
										placeholder="Company"
										class="font-semibold"
									/>
									<span class="text-muted-foreground">—</span>
									<InlineField bind:value={job.role} placeholder="Role" class="flex-1" />
								</div>
								<Button
									variant="ghost"
									size="icon"
									class="text-muted-foreground hover:text-destructive shrink-0"
									aria-label="Remove job"
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
									<SegmentedControlItem value={false} aria-label="Past role"
										>Past</SegmentedControlItem
									>
									<SegmentedControlItem value={true} aria-label="Current role"
										>Current</SegmentedControlItem
									>
								</SegmentedControl>
							</div>
							<EditableList
								bind:items={job.achievements}
								placeholder="Describe an achievement..."
								addLabel="Add Achievement"
							/>
							<TagInput bind:tags={job.skills} placeholder="Add skill (e.g. React, AWS)" />
						</div>
					{/snippet}
				</SortableItem>
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
