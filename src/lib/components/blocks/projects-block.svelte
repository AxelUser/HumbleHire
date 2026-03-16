<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus } from '@lucide/svelte';
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
</script>

<BlockWrapper title="Projects" bind:visible>
	<div class="flex flex-col">
		{#each projects as project (project.id)}
			<div class="border rounded-lg p-4 mb-4">
				<div class="flex items-start justify-between gap-2 mb-2">
					<InlineField bind:value={project.name} placeholder="Project name" class="font-semibold flex-1" />
					<Button
						variant="ghost"
						size="icon"
						class="shrink-0 text-muted-foreground hover:text-destructive"
						onclick={() => removeProject(project.id)}
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
				<InlineTextarea
					bind:value={project.description}
					placeholder="Describe the project..."
					class="w-full mb-2"
					rows={3}
				/>
				<InlineField
					bind:value={project.stack}
					placeholder="Tech stack (e.g. TypeScript, Svelte, Postgres)"
					class="text-sm text-muted-foreground w-full mb-1"
				/>
				<InlineField
					bind:value={project.link}
					placeholder="Link (optional)"
					class="text-sm w-full"
				/>
			</div>
		{/each}
		<Button variant="outline" size="sm" class="self-start" onclick={addProject}>
			<Plus class="h-4 w-4 mr-1" />
			Add Project
		</Button>
	</div>
</BlockWrapper>
