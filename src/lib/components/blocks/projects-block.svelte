<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { TagInput } from '$lib/components/ui/tag-input';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import type { ProjectEntry, ObjectId } from '$lib/types/cv';
	import { createObjectId } from '$lib/types/cv';

	interface Props {
		projects: ProjectEntry[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { projects = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();

	function addProject() {
		projects = [
			...projects,
			{
				objectId: createObjectId(),
				name: '',
				description: '',
				stack: [],
				link: ''
			}
		];
	}

	function removeProject(objectId: ObjectId) {
		projects = projects.filter((p) => p.objectId !== objectId);
	}

	function onDragOver(event: any) {
		projects = move(projects as any, event) as ProjectEntry[];
	}

	function onDragEnd(event: any) {
		projects = move(projects as any, event) as ProjectEntry[];
	}
</script>

<BlockWrapper title="Projects" {blockId} bind:hiddenBlockIds>
	<DragDropProvider {onDragEnd} {onDragOver}>
		<div class="flex flex-col gap-4">
			{#each projects as project, index (project.objectId)}
				{@const sortable = createSortable({ id: project.objectId, index: (() => index) as any })}
				<div
					class="rounded-lg p-4 {sortable.isDragging
						? 'border-muted border-2 border-dashed'
						: 'border'}"
					{@attach sortable.attach}
				>
					<div class="flex flex-col gap-2 {sortable.isDragging ? 'invisible' : ''}">
						<div class="flex items-center justify-between gap-2">
							<span
								{@attach sortable.attachHandle}
								class="text-muted-foreground shrink-0 cursor-grab"
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
						<TagInput bind:tags={project.stack} placeholder="Add tech (e.g. TypeScript, Svelte)" />
						<InlineField
							bind:value={project.link}
							placeholder="Link (optional)"
							class="w-full text-sm"
						/>
					</div>
				</div>
			{/each}
			<Button variant="outline" size="sm" class="self-start" onclick={addProject}>
				<Plus class="mr-1 h-4 w-4" />
				Add Project
			</Button>
		</div>
		<DragOverlay>
			{#snippet children(source: any)}
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
