<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import type { ProjectEntry } from '$lib/types/cv';

	interface Props {
		projects: ProjectEntry[];
		visible: boolean;
	}

	let { projects = $bindable(), visible = $bindable() }: Props = $props();

	function addProject() {
		projects = [
			...projects,
			{
				id: crypto.randomUUID(),
				name: '',
				description: '',
				stack: '',
				link: ''
			}
		];
	}

	function removeProject(id: string) {
		projects = projects.filter((p) => p.id !== id);
	}

	function onDragOver(event: any) {
		projects = move(projects, event);
	}

	function onDragEnd(event: any) {
		projects = move(projects, event);
	}
</script>

<BlockWrapper title="Projects" bind:visible>
	<div class="flex flex-col gap-4">
		<DragDropProvider {onDragEnd} {onDragOver}>
			{#each projects as project, index (project.id)}
				{@const sortable = createSortable({ id: project.id, index: (() => index) as any })}
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
								bind:value={project.name}
								placeholder="Project name"
								class="flex-1 font-semibold"
							/>
							<Button
								variant="ghost"
								size="icon"
								class="text-muted-foreground hover:text-destructive shrink-0"
								onclick={() => removeProject(project.id)}
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
						<InlineField
							bind:value={project.stack}
							placeholder="Tech stack (e.g. TypeScript, Svelte, Postgres)"
							class="text-muted-foreground w-full text-sm"
						/>
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
			<DragOverlay>
				{#snippet children(source: any)}
					{@const project = projects.find((p) => p.id === source.id)}
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
	</div>
</BlockWrapper>
