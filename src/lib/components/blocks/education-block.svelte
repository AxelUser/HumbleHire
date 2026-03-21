<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { DatePickerField } from '$lib/components/ui/date-picker';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus } from '@lucide/svelte';
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
</script>

<BlockWrapper title="Education" bind:visible>
	<div class="flex flex-col gap-4">
		{#each education as entry (entry.id)}
			<div class="border rounded-lg p-4">
				<div class="flex flex-col gap-2">
					<div class="flex items-start justify-between gap-2">
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
	</div>
</BlockWrapper>
