<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { TagInput } from '$lib/components/ui/tag-input';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { SortableItem, createSortableDragHandlers } from '$lib/components/ui/sortable';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import type { Draggable } from '@dnd-kit/dom';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { createObjectId, type ProjectEntry, type ObjectId } from '$lib/types/cv';

	interface Props {
		projects: ProjectEntry[];
		hidden: string[];
	}

	let { projects = $bindable(), hidden = $bindable() }: Props = $props();

	const drag = createSortableDragHandlers(
		() => projects,
		(items) => {
			projects = items;
		}
	);

	function addProject() {
		projects = [
			...projects,
			{
				objectId: createObjectId(),
				name: '',
				description: '',
				url: '',
				current: false,
				highlights: [],
				keywords: [],
				roles: []
			}
		];
	}

	function removeProject(objectId: ObjectId) {
		projects = projects.filter((p) => p.objectId !== objectId);
	}
</script>

<BlockWrapper title="Projects" path="projects/" bind:hidden>
	<DragDropProvider {...drag}>
		<div class="flex flex-col gap-4">
			{#each projects as project, index (project.objectId)}
				<SortableItem id={project.objectId} {index} class="rounded-lg p-4">
					{#snippet children({ attachHandle, isDragging })}
						<div class="flex flex-col gap-2 {isDragging ? 'invisible' : ''}">
							<div class="flex items-center justify-between gap-2">
								<span {@attach attachHandle} class="text-muted-foreground shrink-0 cursor-grab"
									><GripVertical class="h-4 w-4" /></span
								>
								<InlineField
									bind:value={project.name}
									placeholder="Project name"
									class="flex-1 font-semibold"
								/>
								<Button
									variant="ghost"
									size="icon"
									class="text-muted-foreground hover:text-destructive shrink-0"
									onclick={() => removeProject(project.objectId)}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
							<InlineTextarea
								bind:value={project.description}
								placeholder="Describe the project..."
								class="w-full"
								rows={3}
							/>
							<TagInput
								bind:tags={project.keywords}
								placeholder="Add tech (e.g. TypeScript, Svelte)"
							/>
							<InlineField
								bind:value={project.url}
								placeholder="Link (optional)"
								class="w-full text-sm"
							/>
						</div>
					{/snippet}
				</SortableItem>
			{/each}
			<Button variant="outline" size="sm" class="self-start" onclick={addProject}>
				<Plus class="mr-1 h-4 w-4" />
				Add Project
			</Button>
		</div>
		<DragOverlay>
			{#snippet children(source: Draggable)}
				{@const project = projects.find((p) => p.objectId === source.id)}
				{#if project}
					<div class="bg-background rounded-lg border p-4 shadow-lg">
						<div class="flex items-start gap-2">
							<GripVertical class="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
							<span class="flex-1 text-sm font-semibold">{project.name || 'Project name'}</span>
						</div>
						{#if project.description}
							<p class="text-muted-foreground mt-1 line-clamp-2 text-sm">{project.description}</p>
						{/if}
					</div>
				{/if}
			{/snippet}
		</DragOverlay>
	</DragDropProvider>
</BlockWrapper>
