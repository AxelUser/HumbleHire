<script lang="ts">
	import { TagInput } from '$lib/components/ui/tag-input';
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import type { SkillCategory } from '$lib/types/cv';

	interface Props {
		skills: SkillCategory[];
		visible: boolean;
	}

	let { skills = $bindable(), visible = $bindable() }: Props = $props();

	const isFlat = $derived(skills.length <= 1 && (skills.length === 0 || skills[0].name === ''));

	$effect.pre(() => {
		if (skills.length === 0) {
			skills = [{ id: crypto.randomUUID(), name: '', skills: [] }];
		}
	});

	function addCategory() {
		skills = [...skills, { id: crypto.randomUUID(), name: '', skills: [] }];
	}

	function removeCategory(id: string) {
		skills = skills.filter((c) => c.id !== id);
	}

	function onDragOver(event: any) {
		skills = move(skills, event);
	}

	function onDragEnd(event: any) {
		skills = move(skills, event);
	}
</script>

<BlockWrapper title="Skills" bind:visible>
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
		<DragDropProvider {onDragEnd} {onDragOver}>
			<div class="flex flex-col gap-4">
				{#each skills as category, index (category.id)}
					{@const sortable = createSortable({ id: category.id, index: (() => index) as any })}
					<div
						class="rounded-lg p-4 {sortable.isDragging
							? 'border-muted border-2 border-dashed'
							: 'border'}"
						{@attach sortable.attach}
					>
						<div class="flex flex-col gap-2 {sortable.isDragging ? 'invisible' : ''}">
							<div class="flex items-start justify-between gap-2">
								<span
									{@attach sortable.attachHandle}
									class="text-muted-foreground mt-1 shrink-0 cursor-grab"
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
									onclick={() => removeCategory(category.id)}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
							<TagInput bind:tags={category.skills} placeholder="Add skill..." />
						</div>
					</div>
				{/each}
				<Button variant="outline" size="sm" class="self-start" onclick={addCategory}>
					<Plus class="mr-1 h-4 w-4" />
					Add Category
				</Button>
			</div>
			<DragOverlay>
				{#snippet children(source: any)}
					{@const category = skills.find((c) => c.id === source.id)}
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
