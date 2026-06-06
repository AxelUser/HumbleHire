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
		bind:value={cv.content.basics.fullName}
		bind:hidden={cv.hidden}
		path="basics/fullName/"
		title="Full Name"
		placeholder="Your full name"
		class="text-3xl font-bold"
	/>
	<TextBlock
		bind:value={cv.content.basics.position}
		bind:hidden={cv.hidden}
		path="basics/position/"
		title="Position"
		placeholder="Your position / job title"
		class="text-muted-foreground text-xl"
	/>
	<TextBlock
		bind:value={cv.content.basics.location}
		bind:hidden={cv.hidden}
		path="basics/location/"
		title="Location"
		placeholder="City, Country"
	/>
	<ContactsBlock bind:basics={cv.content.basics} bind:hidden={cv.hidden} />
	<BulletListBlock bind:highlights={cv.content.basics.highlights} bind:hidden={cv.hidden} />
	<SkillsBlock bind:skills={cv.content.skills} bind:hidden={cv.hidden} />
	<JobHistoryBlock bind:jobs={cv.content.work} bind:hidden={cv.hidden} />
	<ProjectsBlock bind:projects={cv.content.projects} bind:hidden={cv.hidden} />
	<EducationBlock bind:education={cv.content.education} bind:hidden={cv.hidden} />
</div>
