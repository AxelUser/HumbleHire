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
	<div class="mx-auto max-w-5xl space-y-4 px-6 py-10">
		<Skeleton class="h-12 w-full" />
		<Skeleton class="h-64 w-full" />
		<Skeleton class="h-32 w-full" />
	</div>
{:else}
	<CvEditorToolbar bind:cvName={cvStore.cv.name} onSaveVersion={() => (saveVersionOpen = true)} />
	<CvPreview bind:cv={cvStore.cv} />
	<div class="mx-auto max-w-3xl px-6 py-4">
		<VersionHistoryPanel cvId={cvStore.cv.id} />
	</div>
	<SaveVersionModal bind:open={saveVersionOpen} />
{/if}
