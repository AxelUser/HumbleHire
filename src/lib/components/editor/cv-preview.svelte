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

<div class="mx-auto max-w-3xl space-y-4 px-6 py-8">
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
		bind:contacts={cv.blocks.contacts}
		blockId={cv.blocks.contactsBlockId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<BulletListBlock
		bind:highlights={cv.blocks.highlights}
		blockId={cv.blocks.highlightsBlockId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<SkillsBlock
		bind:skills={cv.blocks.skills}
		blockId={cv.blocks.skillsBlockId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<JobHistoryBlock
		bind:jobs={cv.blocks.jobHistory}
		blockId={cv.blocks.jobHistoryBlockId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<ProjectsBlock
		bind:projects={cv.blocks.projects}
		blockId={cv.blocks.projectsBlockId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
	<EducationBlock
		bind:education={cv.blocks.education}
		blockId={cv.blocks.educationBlockId}
		bind:hiddenBlockIds={cv.hiddenBlockIds}
	/>
</div>
