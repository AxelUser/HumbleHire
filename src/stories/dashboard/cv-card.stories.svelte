<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CvCard from '$lib/components/dashboard/cv-card.svelte';
	import { fn } from 'storybook/test';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof CvCard>;

	const mockCV = {
		id: 'cv-1',
		name: 'Senior Developer — Stripe',
		createdAt: Date.now() - 86400000 * 3,
		updatedAt: Date.now() - 3600000,
		blocks: {
			fullName: 'Aleksey Maltsev',
			position: 'Senior Software Engineer',
			location: 'San Francisco, CA',
			contacts: [],
			highlights: [],
			skills: [],
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
			skills: true,
			jobHistory: true,
			projects: true,
			education: true
		}
	};

	const { Story } = defineMeta({
		title: 'Dashboard/CvCard',
		component: CvCard,
		tags: ['autodocs'],
		args: { cv: mockCV, onDelete: fn() }
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
