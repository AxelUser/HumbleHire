<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import {
		TextBlock,
		BulletListBlock,
		ContactsBlock,
		SkillsBlock,
		JobHistoryBlock,
		ProjectsBlock,
		EducationBlock
	} from '$lib/components/blocks';

	interface Props {
		cv: CV;
	}

	let { cv = $bindable() }: Props = $props();
</script>

<div class="mx-auto space-y-4 py-8 pr-6">
	<TextBlock
		bind:block={cv.blocks.fullName}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
		title="Full Name"
		placeholder="Your full name"
		class="text-3xl font-bold"
	/>
	<TextBlock
		bind:block={cv.blocks.position}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
		title="Position"
		placeholder="Your position / job title"
		class="text-muted-foreground text-xl"
	/>
	<TextBlock
		bind:block={cv.blocks.location}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
		title="Location"
		placeholder="City, Country"
	/>
	<ContactsBlock
		bind:contacts={cv.blocks.contacts.value}
		blockId={cv.blocks.contacts.objectId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<BulletListBlock
		bind:highlights={cv.blocks.highlights.value}
		blockId={cv.blocks.highlights.objectId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<SkillsBlock
		bind:skills={cv.blocks.skills.value}
		blockId={cv.blocks.skills.objectId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<JobHistoryBlock
		bind:jobs={cv.blocks.jobHistory.value}
		blockId={cv.blocks.jobHistory.objectId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<ProjectsBlock
		bind:projects={cv.blocks.projects.value}
		blockId={cv.blocks.projects.objectId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<EducationBlock
		bind:education={cv.blocks.education.value}
		blockId={cv.blocks.education.objectId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
</div>
