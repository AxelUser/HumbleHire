<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { db } from '$lib/db/index';
	import { CVStore, setCVStoreContext } from '$lib/stores/cv.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { CvEditorToolbar, CvPreview, SaveVersionModal, VersionHistoryPanel } from '$lib/components/editor';

	const cvStore = new CVStore();
	setCVStoreContext(cvStore);

	let saveVersionOpen = $state(false);

	onMount(async () => {
		const id = page.params.id;
		const loaded = await db.cvs.get(id);
		if (!loaded) {
			goto(resolve(`/`));
			return;
		}
		cvStore.cv = loaded;
	});
</script>

{#if cvStore.cv === null}
	<div class="container mx-auto max-w-3xl px-6 py-10 space-y-4">
		<Skeleton class="h-12 w-full" />
		<Skeleton class="h-64 w-full" />
		<Skeleton class="h-32 w-full" />
	</div>
{:else}
	<div class="min-h-screen flex flex-col">
		<CvEditorToolbar bind:cvName={cvStore.cv.name} onSaveVersion={() => (saveVersionOpen = true)} />
		<main class="flex-1 overflow-y-auto">
			<CvPreview bind:cv={cvStore.cv} />
		</main>
		<div class="border-t px-6 py-4">
			<VersionHistoryPanel cvId={cvStore.cv.id} />
		</div>
	</div>
	<SaveVersionModal bind:open={saveVersionOpen} />
{/if}
