<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CvList from '$lib/components/dashboard/cv-list.svelte';
	import { fn } from 'storybook/test';
	import type { ComponentProps } from 'svelte';
	import type { CV } from '$lib/types/cv';

	type Props = ComponentProps<typeof CvList>;

	const now = Date.now();

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

	const mockCVs: CV[] = [
		{
			id: 'cv-1',
			name: 'Senior Developer — Stripe',
			notes: '',
			version: 5,
			createdAt: now - 86400000 * 5,
			updatedAt: now - 3600000,
			blocks: mkBlocks('Aleksey Maltsev', 'Senior Software Engineer', 'San Francisco, CA'),
			hiddenBlockIds: []
		},
		{
			id: 'cv-2',
			name: 'Frontend Lead — Vercel',
			notes: '',
			version: 2,
			createdAt: now - 86400000 * 2,
			updatedAt: now - 7200000,
			blocks: mkBlocks('Aleksey Maltsev', 'Frontend Lead', 'Remote'),
			hiddenBlockIds: []
		},
		{
			id: 'cv-3',
			name: 'Untitled CV',
			notes: '',
			version: 1,
			createdAt: now - 3600000,
			updatedAt: now - 1800000,
			blocks: mkBlocks('', '', ''),
			hiddenBlockIds: []
		}
	];

	const { Story } = defineMeta({
		title: 'Dashboard/CvList',
		component: CvList,
		tags: ['autodocs'],
		args: { onDelete: fn(), onTailor: fn(), onSync: fn() }
	});
</script>

<Story name="WithThreeCVs" args={{ cvs: mockCVs, onDelete: fn(), onTailor: fn(), onSync: fn() }}>
	{#snippet template(args: Props)}
		<CvList {...args} />
	{/snippet}
</Story>

<Story name="EmptyState" args={{ cvs: [], onDelete: fn(), onTailor: fn(), onSync: fn() }}>
	{#snippet template(args: Props)}
		<CvList {...args} />
	{/snippet}
</Story>
