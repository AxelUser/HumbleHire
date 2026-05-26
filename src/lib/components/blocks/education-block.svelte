<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { DatePickerField } from '$lib/components/ui/date-picker';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import type { EducationEntry, ObjectId } from '$lib/types/cv';
	import { createObjectId } from '$lib/types/cv';

	interface Props {
		education: EducationEntry[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { education = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();

	function addEducation() {
		education = [
			...education,
			{
				objectId: createObjectId(),
				institution: '',
				degree: '',
				startDate: undefined,
				endDate: undefined,
				current: false
			}
		];
	}

	function removeEducation(objectId: ObjectId) {
		education = education.filter((e) => e.objectId !== objectId);
	}

	function onDragOver(event: any) {
		education = move(education as any, event) as EducationEntry[];
	}

	function onDragEnd(event: any) {
		education = move(education as any, event) as EducationEntry[];
	}
</script>

<BlockWrapper title="Education" {blockId} bind:hiddenBlockIds>
	<DragDropProvider {onDragEnd} {onDragOver}>
		<div class="flex flex-col gap-4">
			{#each education as entry, index (entry.objectId)}
				{@const sortable = createSortable({ id: entry.objectId, index: (() => index) as any })}
				<div
					{@attach sortable.attach}
					class="relative rounded-lg p-4 {sortable.isDragging
						? 'border-muted border-2 border-dashed'
						: 'border'} {entry.current && !sortable.isDragging
						? 'pl-[18px] shadow-[inset_4px_0_0_0_var(--accent)]'
						: ''}"
				>
					<div class="flex flex-col gap-2 {sortable.isDragging ? 'invisible' : ''}">
						<div class="flex items-start justify-between gap-2">
							<span
								{@attach sortable.attachHandle}
								class="text-muted-foreground mt-1 shrink-0 cursor-grab"
								><GripVertical class="h-4 w-4" /></span
							>
							<InlineField
								bind:value={entry.institution}
								placeholder="Institution"
								class="flex-1 font-semibold"
							/>
							<Button
								variant="ghost"
								size="icon"
								class="text-muted-foreground hover:text-destructive shrink-0"
								onclick={() => removeEducation(entry.objectId)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
						<InlineField
							bind:value={entry.degree}
							placeholder="Degree / Field of study"
							class="w-full"
						/>
						<div class="flex flex-wrap items-center gap-2">
							<DatePickerField bind:value={entry.startDate} placeholder="Start date" />
							<span class="text-muted-foreground">—</span>
							{#if entry.current}
								<span class="text-muted-foreground font-mono font-bold tracking-wider uppercase">
									Present
								</span>
							{:else}
								<DatePickerField bind:value={entry.endDate} placeholder="End date" />
							{/if}
							<ButtonGroup class="ml-auto font-mono tracking-wider uppercase" role="radiogroup">
								<Button
									size="sm"
									variant={entry.current ? 'outline' : 'default'}
									role="radio"
									aria-checked={!entry.current}
									aria-label="Completed study"
									onclick={() => (entry.current = false)}>Done</Button
								>
								<Button
									size="sm"
									variant={entry.current ? 'default' : 'outline'}
									role="radio"
									aria-checked={entry.current}
									aria-label="Ongoing study"
									onclick={() => (entry.current = true)}>Ongoing</Button
								>
							</ButtonGroup>
						</div>
					</div>
				</div>
			{/each}
			<Button variant="outline" size="sm" class="self-start" onclick={addEducation}>
				<Plus class="mr-1 h-4 w-4" />
				Add Education
			</Button>
		</div>
		<DragOverlay>
			{#snippet children(source: any)}
				{@const entry = education.find((e) => e.objectId === source.id)}
				{#if entry}
					<div class="bg-background rounded-lg border p-4 shadow-lg">
						<div class="flex flex-col gap-2">
							<div class="flex items-start gap-2">
								<GripVertical class="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
								<span class="flex-1 text-sm font-semibold"
									>{entry.institution || 'Institution'}</span
								>
							</div>
							<span class="text-muted-foreground text-sm"
								>{entry.degree || 'Degree / Field of study'}</span
							>
						</div>
					</div>
				{/if}
			{/snippet}
		</DragOverlay>
	</DragDropProvider>
</BlockWrapper>
