<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { InlineTextarea } from '$lib/components/ui/inline-textarea';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus } from '@lucide/svelte';
	import type { JobEntry } from '$lib/types/cv';

	interface Props {
		jobs: JobEntry[];
		visible: boolean;
	}

	let { jobs = $bindable(), visible = $bindable() }: Props = $props();

	function addJob() {
		jobs = [
			...jobs,
			{
				id: crypto.randomUUID(),
				company: '',
				role: '',
				startDate: '',
				endDate: '',
				achievements: []
			}
		];
	}

	function removeJob(id: string) {
		jobs = jobs.filter((j) => j.id !== id);
	}

	function addAchievement(job: JobEntry) {
		job.achievements = [...job.achievements, ''];
	}

	function removeAchievement(job: JobEntry, index: number) {
		job.achievements = job.achievements.filter((_, i) => i !== index);
	}
</script>

<BlockWrapper title="Job History" bind:visible>
	<div class="flex flex-col">
		{#each jobs as job (job.id)}
			<div class="border rounded-lg p-4 mb-4">
				<div class="flex items-start justify-between gap-2 mb-2">
					<div class="flex flex-wrap items-baseline gap-2 flex-1">
						<InlineField bind:value={job.company} placeholder="Company" class="font-semibold" />
						<span class="text-muted-foreground">—</span>
						<InlineField bind:value={job.role} placeholder="Role" class="flex-1" />
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="shrink-0 text-muted-foreground hover:text-destructive"
						onclick={() => removeJob(job.id)}
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
				<div class="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
					<InlineField bind:value={job.startDate} placeholder="Start date" />
					<span>–</span>
					<InlineField bind:value={job.endDate} placeholder="End date" />
				</div>
				<div class="flex flex-col gap-2">
					{#each job.achievements as _, index (index)}
						<div class="flex items-start gap-2">
							<span class="mt-[0.2rem] text-lg leading-none text-muted-foreground select-none">■</span>
							<InlineTextarea
								bind:value={job.achievements[index]}
								placeholder="Describe an achievement..."
								class="flex-1"
								rows={2}
							/>
							<Button
								variant="ghost"
								size="icon"
								class="shrink-0 mt-1 text-muted-foreground hover:text-destructive"
								onclick={() => removeAchievement(job, index)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
					{/each}
					<Button
						variant="outline"
						size="sm"
						class="mt-1 self-start"
						onclick={() => addAchievement(job)}
					>
						<Plus class="h-4 w-4 mr-1" />
						Add Achievement
					</Button>
				</div>
			</div>
		{/each}
		<Button variant="outline" size="sm" class="self-start" onclick={addJob}>
			<Plus class="h-4 w-4 mr-1" />
			Add Job
		</Button>
	</div>
</BlockWrapper>
