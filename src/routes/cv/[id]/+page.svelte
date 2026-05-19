<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { db } from '$lib/db/index';
	import { CVStore, setCVStoreContext } from '$lib/stores/cv.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { CvEditorToolbar, CvPreview } from '$lib/components/editor';
	import type { CV } from '$lib/types/cv';

	const cvStore = new CVStore();
	setCVStoreContext(cvStore);

	let masterCv = $state<CV | undefined>(undefined);

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
	<CvEditorToolbar bind:cvName={cvStore.cv.name} {masterCv} />
	<CvPreview bind:cv={cvStore.cv} />
{/if}
