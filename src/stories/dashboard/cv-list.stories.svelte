<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CvList from '$lib/components/dashboard/cv-list.svelte';
	import { fn } from 'storybook/test';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof CvList>;

	const now = Date.now();

	const mockCVs = [
		{
			id: 'cv-1',
			name: 'Senior Developer — Stripe',
			createdAt: now - 86400000 * 5,
			updatedAt: now - 3600000,
			blocks: {
				fullName: 'Aleksey Maltsev',
				position: 'Senior Software Engineer',
				location: 'San Francisco, CA',
				contacts: [],
				highlights: [],
				jobHistory: [],
				projects: [],
				education: []
			},
			blockVisibility: {
				fullName: true,
				position: true,
				location: true,
				contacts: true,
				highlights: true,
				jobHistory: true,
				projects: true,
				education: true
			}
		},
		{
			id: 'cv-2',
			name: 'Frontend Lead — Vercel',
			createdAt: now - 86400000 * 2,
			updatedAt: now - 7200000,
			blocks: {
				fullName: 'Aleksey Maltsev',
				position: 'Frontend Lead',
				location: 'Remote',
				contacts: [],
				highlights: [],
				jobHistory: [],
				projects: [],
				education: []
			},
			blockVisibility: {
				fullName: true,
				position: true,
				location: true,
				contacts: true,
				highlights: true,
				jobHistory: true,
				projects: true,
				education: true
			}
		},
		{
			id: 'cv-3',
			name: 'Untitled CV',
			createdAt: now - 3600000,
			updatedAt: now - 1800000,
			blocks: {
				fullName: '',
				position: '',
				location: '',
				contacts: [],
				highlights: [],
				jobHistory: [],
				projects: [],
				education: []
			},
			blockVisibility: {
				fullName: true,
				position: true,
				location: true,
				contacts: true,
				highlights: true,
				jobHistory: true,
				projects: true,
				education: true
			}
		}
	];

	const { Story } = defineMeta({
		title: 'Dashboard/CvList',
		component: CvList,
		tags: ['autodocs'],
		args: { onDelete: fn() }
	});
</script>

<Story name="WithThreeCVs" args={{ cvs: mockCVs, onDelete: fn() }}>
	{#snippet template(args: Props)}
		<CvList {...args} />
	{/snippet}
</Story>

<Story name="EmptyState" args={{ cvs: [], onDelete: fn() }}>
	{#snippet template(args: Props)}
		<CvList {...args} />
	{/snippet}
</Story>
