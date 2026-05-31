<script lang="ts">
	import { TagInput } from '$lib/components/ui/tag-input';
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { SortableItem, createSortableDragHandlers } from '$lib/components/ui/sortable';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import type { SkillCategory, ObjectId } from '$lib/types/cv';
	import { createObjectId } from '$lib/types/cv';

	interface Props {
		skills: SkillCategory[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { skills = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();

	const isFlat = $derived(skills.length <= 1 && (skills.length === 0 || skills[0].name === ''));

	const drag = createSortableDragHandlers(
		() => skills,
		(items) => {
			skills = items;
		}
	);

	$effect.pre(() => {
		if (skills.length === 0) {
			skills = [{ objectId: createObjectId(), name: '', skills: [] }];
		}
	});

	function addCategory() {
		skills = [...skills, { objectId: createObjectId(), name: '', skills: [] }];
	}

	function removeCategory(objectId: ObjectId) {
		skills = skills.filter((c) => c.objectId !== objectId);
	}
</script>

<BlockWrapper title="Skills" {blockId} bind:hiddenBlockIds>
	{#if isFlat}
		<div class="flex flex-col gap-2">
			<TagInput
				bind:tags={skills[0].skills}
				placeholder="Add skill (e.g. React, AWS, Leadership)"
			/>
			<Button variant="outline" size="sm" class="self-start" onclick={addCategory}>
				<Plus class="mr-1 h-4 w-4" />
				Add Category
			</Button>
		</div>
	{:else}
		<DragDropProvider {...drag}>
			<div class="flex flex-col gap-4">
				{#each skills as category, index (category.objectId)}
					<SortableItem id={category.objectId} {index} class="rounded-lg p-4">
						{#snippet children({ attachHandle, isDragging })}
							<div class="flex flex-col gap-2 {isDragging ? 'invisible' : ''}">
								<div class="flex items-center justify-between gap-2">
									<span {@attach attachHandle} class="text-muted-foreground shrink-0 cursor-grab"
										><GripVertical class="h-4 w-4" /></span
									>
									<InlineField
										bind:value={category.name}
										placeholder="Category name"
										class="flex-1 font-semibold"
									/>
									<Button
										variant="ghost"
										size="icon"
										class="text-muted-foreground hover:text-destructive shrink-0"
										onclick={() => removeCategory(category.objectId)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
								<TagInput bind:tags={category.skills} placeholder="Add skill..." />
							</div>
						{/snippet}
					</SortableItem>
				{/each}
				<Button variant="outline" size="sm" class="self-start" onclick={addCategory}>
					<Plus class="mr-1 h-4 w-4" />
					Add Category
				</Button>
			</div>
			<DragOverlay>
				{#snippet children(source: any)}
					{@const category = skills.find((c) => c.objectId === source.id)}
					{#if category}
						<div class="bg-background rounded-lg border p-4 shadow-lg">
							<div class="flex items-start gap-2">
								<GripVertical class="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
								<span class="flex-1 text-sm font-semibold">{category.name || 'Category'}</span>
							</div>
						</div>
					{/if}
				{/snippet}
			</DragOverlay>
		</DragDropProvider>
	{/if}
</BlockWrapper>
