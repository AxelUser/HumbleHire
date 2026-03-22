<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { DatePickerField } from '$lib/components/ui/date-picker';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import type { EducationEntry } from '$lib/types/cv';

	interface Props {
		education: EducationEntry[];
		visible: boolean;
	}

	let { education = $bindable(), visible = $bindable() }: Props = $props();

	function addEducation() {
		education = [
			...education,
			{
				id: crypto.randomUUID(),
				institution: '',
				degree: '',
				startDate: undefined,
				endDate: undefined
			}
		];
	}

	function removeEducation(id: string) {
		education = education.filter((e) => e.id !== id);
	}

	function onDragOver(event: any) {
		education = move(education, event);
	}

	function onDragEnd(event: any) {
		education = move(education, event);
	}
</script>

<BlockWrapper title="Education" bind:visible>
	<div class="flex flex-col gap-4">
		<DragDropProvider {onDragEnd} {onDragOver}>
			{#each education as entry, index (entry.id)}
				{@const sortable = createSortable({ id: entry.id, index: (() => index) as any })}
				<div
					{@attach sortable.attach}
					class="rounded-lg p-4 {sortable.isDragging
						? 'border-2 border-dashed border-muted'
						: 'border'}"
				>
					<div class="flex flex-col gap-2 {sortable.isDragging ? 'invisible' : ''}">
						<div class="flex items-start justify-between gap-2">
							<span
								{@attach sortable.attachHandle}
								class="shrink-0 text-muted-foreground cursor-grab mt-1"
								><GripVertical class="h-4 w-4" /></span
							>
							<InlineField
								bind:value={entry.institution}
								placeholder="Institution"
								class="font-semibold flex-1"
							/>
							<Button
								variant="ghost"
								size="icon"
								class="shrink-0 text-muted-foreground hover:text-destructive"
								onclick={() => removeEducation(entry.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
						<InlineField
							bind:value={entry.degree}
							placeholder="Degree / Field of study"
							class="w-full"
						/>
						<div class="flex items-center gap-2">
							<DatePickerField bind:value={entry.startDate} placeholder="Start date" />
							<span class="text-muted-foreground">–</span>
							<DatePickerField bind:value={entry.endDate} placeholder="End date" />
						</div>
					</div>
				</div>
			{/each}
			<Button variant="outline" size="sm" class="self-start" onclick={addEducation}>
				<Plus class="h-4 w-4 mr-1" />
				Add Education
			</Button>
			<DragOverlay>
				{#snippet children(source: any)}
					{@const entry = education.find((e) => e.id === source.id)}
					{#if entry}
						<div class="border rounded-lg p-4 bg-background shadow-lg">
							<div class="flex flex-col gap-2">
								<div class="flex items-start gap-2">
									<GripVertical class="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
									<span class="font-semibold flex-1 text-sm">{entry.institution || 'Institution'}</span>
								</div>
								<span class="text-sm text-muted-foreground">{entry.degree || 'Degree / Field of study'}</span>
							</div>
						</div>
					{/if}
				{/snippet}
			</DragOverlay>
		</DragDropProvider>
	</div>
</BlockWrapper>
