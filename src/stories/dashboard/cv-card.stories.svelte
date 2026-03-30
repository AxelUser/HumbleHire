<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CvCard from '$lib/components/dashboard/cv-card.svelte';
	import { fn } from 'storybook/test';
	import type { ComponentProps } from 'svelte';
	import type { CV } from '$lib/types/cv';

	type Props = ComponentProps<typeof CvCard>;

	function mkBlocks(name: string, position: string, location: string) {
		return {
			fullName: { objectId: `${name}-fn` as any, value: name },
			position: { objectId: `${name}-pos` as any, value: position },
			location: { objectId: `${name}-loc` as any, value: location },
			contactsBlockId: `${name}-cb` as any,
			contacts: [],
			highlightsBlockId: `${name}-hb` as any,
			highlights: [],
			skillsBlockId: `${name}-sb` as any,
			skills: [],
			jobHistoryBlockId: `${name}-jb` as any,
			jobHistory: [],
			projectsBlockId: `${name}-pb` as any,
			projects: [],
			educationBlockId: `${name}-eb` as any,
			education: []
		};
	}

	const mockCV: CV = {
		id: 'cv-1',
		name: 'Senior Developer — Stripe',
		notes: '',
		version: 3,
		createdAt: Date.now() - 86400000 * 3,
		updatedAt: Date.now() - 3600000,
		blocks: mkBlocks('Aleksey Maltsev', 'Senior Software Engineer', 'San Francisco, CA'),
		hiddenBlockIds: []
	};

	const { Story } = defineMeta({
		title: 'Dashboard/CvCard',
		component: CvCard,
		tags: ['autodocs'],
		args: { cv: mockCV, allCvs: [mockCV], onDelete: fn(), onTailor: fn(), onSync: fn() }
	});
</script>

<Story name="Default">
	{#snippet template(args: Props)}
		<div class="w-72">
			<CvCard {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Minimal" args={{ cv: { ...mockCV, id: 'cv-2', name: 'Untitled CV' } }}>
	{#snippet template(args: Props)}
		<div class="w-72">
			<CvCard {...args} />
		</div>
	{/snippet}
</Story>
