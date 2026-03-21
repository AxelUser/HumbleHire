<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { DatePickerField } from '$lib/components/ui/date-picker';
	import { EditableList } from '$lib/components/ui/editable-list';
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
				startDate: undefined,
				endDate: undefined,
				achievements: []
			}
		];
	}

	function removeJob(id: string) {
		jobs = jobs.filter((j) => j.id !== id);
	}
</script>

<BlockWrapper title="Job History" bind:visible>
	<div class="flex flex-col gap-4">
		{#each jobs as job (job.id)}
			<div class="border rounded-lg p-4">
				<div class="flex flex-col gap-2">
					<div class="flex items-start justify-between gap-2">
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
					<div class="flex items-center gap-2">
						<DatePickerField bind:value={job.startDate} placeholder="Start date" />
						<span class="text-muted-foreground">–</span>
						<DatePickerField bind:value={job.endDate} placeholder="End date" />
					</div>
					<EditableList
						bind:items={job.achievements}
						placeholder="Describe an achievement..."
						addLabel="Add Achievement"
					/>
				</div>
			</div>
		{/each}
		<Button variant="outline" size="sm" class="self-start" onclick={addJob}>
			<Plus class="h-4 w-4 mr-1" />
			Add Job
		</Button>
	</div>
</BlockWrapper>
