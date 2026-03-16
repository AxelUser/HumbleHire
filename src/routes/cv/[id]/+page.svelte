<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { db } from '$lib/db/index';
	import { setCV } from '$lib/stores/cv.svelte';
	import type { CV } from '$lib/types/cv';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { CvEditorToolbar, CvPreview, SaveVersionModal, VersionHistoryPanel } from '$lib/components/editor';

	let cv = $state<CV | null>(null);
	let saveVersionOpen = $state(false);

	onMount(async () => {
		const id = page.params.id;
		const loaded = await db.cvs.get(id);
		if (!loaded) {
			goto(resolve(`/`));
			return;
		}
		cv = loaded;
		setCV(loaded);
	});

	// Sync local cv state into the module store so auto-save picks up changes
	// made via two-way bindings in CvPreview. setCV writes to a separate
	// module-level $state in cv.svelte.ts — there is no circular dependency.
	$effect(() => {
		if (cv) setCV(cv);
	});
</script>

{#if cv === null}
	<div class="container mx-auto max-w-3xl px-6 py-10 space-y-4">
		<Skeleton class="h-12 w-full" />
		<Skeleton class="h-64 w-full" />
		<Skeleton class="h-32 w-full" />
	</div>
{:else}
	<div class="min-h-screen flex flex-col">
		<CvEditorToolbar bind:cvName={cv.name} onSaveVersion={() => (saveVersionOpen = true)} />
		<main class="flex-1 overflow-y-auto">
			<CvPreview bind:cv />
		</main>
		<div class="border-t px-6 py-4">
			<VersionHistoryPanel cvId={cv.id} />
		</div>
	</div>
	<SaveVersionModal bind:open={saveVersionOpen} />
{/if}
