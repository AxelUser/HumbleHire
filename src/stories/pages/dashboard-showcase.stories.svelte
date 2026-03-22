<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '$lib/components/layout/header.svelte';
	import CvList from '$lib/components/dashboard/cv-list.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	import { fn } from 'storybook/test';

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
		},
		{
			id: 'cv-3',
			name: 'Open Source Contributor',
			createdAt: now - 86400000,
			updatedAt: now - 900000,
			blocks: {
				fullName: 'Aleksey Maltsev',
				position: 'Open Source Contributor',
				location: 'Edinburgh, UK',
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
		}
	];

	const { Story } = defineMeta({
		title: 'Pages/DashboardShowcase',
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="WithCVs">
	<div class="bg-background flex min-h-screen flex-col">
		<Header />
		<main class="flex-1 px-6 py-8">
			<div class="mx-auto max-w-5xl">
				<div class="mb-8">
					<h1 class="mb-2 text-3xl font-extrabold">My CVs</h1>
					<p class="text-muted-foreground">Create and manage your resumes.</p>
				</div>
				<CvList cvs={mockCVs} onDelete={fn()} />
			</div>
		</main>
		<Footer />
	</div>
</Story>

<Story name="EmptyState">
	<div class="bg-background flex min-h-screen flex-col">
		<Header />
		<main class="flex-1 px-6 py-8">
			<div class="mx-auto max-w-5xl">
				<div class="mb-8">
					<h1 class="mb-2 text-3xl font-extrabold">My CVs</h1>
					<p class="text-muted-foreground">Create and manage your resumes.</p>
				</div>
				<CvList cvs={[]} onDelete={fn()} />
			</div>
		</main>
		<Footer />
	</div>
</Story>
