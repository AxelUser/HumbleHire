<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { db } from '$lib/db/index';
	import { CVStore, setCVStoreContext } from '$lib/stores/cv.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { CvEditorToolbar, CvPreview, PdfPreviewPane } from '$lib/components/editor';
	import {
		Drawer,
		DrawerContent,
		DrawerHeader,
		DrawerTitle
	} from '$lib/components/ui/drawer';
	import type { CV } from '$lib/types/cv';

	const cvStore = new CVStore();
	setCVStoreContext(cvStore);

	let masterCv = $state<CV | undefined>(undefined);
	let previewOpen = $state(false);
	let innerWidth = $state(0);

	const isLarge = $derived(innerWidth >= 1024);

	onMount(async () => {
		const id = page.params.id;
		const loaded = await db.cvs.get(id);
		if (!loaded) {
			goto(resolve(`/`));
			return;
		}
		cvStore.cv = loaded;

		if (loaded.sourceId) {
			masterCv = await db.cvs.get(loaded.sourceId);
			if (!masterCv) {
				await db.cvs.update(id, { sourceId: undefined, syncDecisions: undefined });
				cvStore.cv = { ...loaded, sourceId: undefined, syncDecisions: undefined };
			}
		}
	});
</script>

<svelte:window bind:innerWidth />

<svelte:head>
	<title>{cvStore.cv?.name ? `${cvStore.cv.name} - HumbleHire` : 'HumbleHire'}</title>
</svelte:head>

{#if cvStore.cv === null}
	<div class="mx-auto max-w-5xl space-y-4 px-6 py-10">
		<Skeleton class="h-12 w-full" />
		<Skeleton class="h-64 w-full" />
		<Skeleton class="h-32 w-full" />
	</div>
{:else}
	<CvEditorToolbar bind:cvName={cvStore.cv.name} {masterCv} bind:previewOpen />

	<div class="px-6">
		<div class="mx-auto flex max-w-7xl items-start">
			<!-- Block editor (left) -->
			<div class="min-w-0 flex-1">
				<CvPreview bind:cv={cvStore.cv} />
			</div>

			<!-- PDF preview pane (desktop ≥lg, always visible) -->
			{#if isLarge}
				<div
					class="border-foreground sticky top-28 h-[calc(100vh-7rem)] w-[460px] shrink-0 overflow-y-auto border-l-2"
				>
					<PdfPreviewPane />
				</div>
			{/if}
		</div>
	</div>

	<!-- Mobile preview drawer (< lg) -->
	{#if !isLarge}
		<Drawer direction="right" bind:open={previewOpen}>
			<DrawerContent class="flex flex-col overflow-hidden">
				<DrawerHeader class="shrink-0">
					<DrawerTitle>PDF Preview</DrawerTitle>
				</DrawerHeader>
				<div class="flex-1 overflow-y-auto">
					{#if previewOpen}
						<PdfPreviewPane />
					{/if}
				</div>
			</DrawerContent>
		</Drawer>
	{/if}
{/if}
