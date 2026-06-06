<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '$lib/components/layout/header.svelte';
	import CvList from '$lib/components/dashboard/cv-list.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	import { fn } from 'storybook/test';

	const now = Date.now();

	import type { CV, CVContent } from '$lib/types/cv';
	import { computeHashes } from '$lib/features/tailoring/hash';
	import { emptyContent } from '$lib/services/cv/create';

	function mkContent(name: string, position: string, location: string): CVContent {
		const content = emptyContent();
		content.basics.fullName = name;
		content.basics.position = position;
		content.basics.location = location;
		return content;
	}

	const cv1Content = mkContent('Aleksey Maltsev', 'Senior Software Engineer', 'San Francisco, CA');
	const cv2Content = mkContent('Aleksey Maltsev', 'Frontend Lead', 'Remote');
	const cv3Content = mkContent('Aleksey Maltsev', 'Open Source Contributor', 'Edinburgh, UK');

	const mockCVs: CV[] = [
		{
			id: 'cv-1',
			name: 'Senior Developer — Stripe',
			createdAt: now - 86400000 * 5,
			updatedAt: now - 3600000,
			content: cv1Content,
			hashes: computeHashes(cv1Content),
			hidden: []
		},
		{
			id: 'cv-2',
			name: 'Frontend Lead — Vercel',
			createdAt: now - 86400000 * 2,
			updatedAt: now - 7200000,
			content: cv2Content,
			hashes: computeHashes(cv2Content),
			hidden: []
		},
		{
			id: 'cv-3',
			name: 'Open Source Contributor',
			createdAt: now - 86400000,
			updatedAt: now - 900000,
			content: cv3Content,
			hashes: computeHashes(cv3Content),
			hidden: []
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
