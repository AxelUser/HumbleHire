<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '$lib/components/layout/header.svelte';
	import CvList from '$lib/components/dashboard/cv-list.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	import { fn } from 'storybook/test';

	const now = Date.now();

	import type { CV, ObjectId } from '$lib/types/cv';

	function oid(s: string): ObjectId { return s as unknown as ObjectId; }

	function mkBlocks(name: string, position: string, location: string) {
		return {
			fullName: { objectId: oid(`${name}-fn`), value: name },
			position: { objectId: oid(`${name}-pos`), value: position },
			location: { objectId: oid(`${name}-loc`), value: location },
			contactsBlockId: oid(`${name}-cb`),
			contacts: [],
			highlightsBlockId: oid(`${name}-hb`),
			highlights: [],
			skillsBlockId: oid(`${name}-sb`),
			skills: [],
			jobHistoryBlockId: oid(`${name}-jb`),
			jobHistory: [],
			projectsBlockId: oid(`${name}-pb`),
			projects: [],
			educationBlockId: oid(`${name}-eb`),
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
			name: 'Open Source Contributor',
			notes: '',
			version: 3,
			createdAt: now - 86400000,
			updatedAt: now - 900000,
			blocks: mkBlocks('Aleksey Maltsev', 'Open Source Contributor', 'Edinburgh, UK'),
			hiddenBlockIds: []
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
				<CvList cvs={mockCVs} onDelete={fn()} onTailor={fn()} onSync={fn()} />
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
				<CvList cvs={[]} onDelete={fn()} onTailor={fn()} onSync={fn()} />
			</div>
		</main>
		<Footer />
	</div>
</Story>
