<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { db } from '$lib/db/index';
	import { CvEditor } from '$lib/components/editor';
	import { AUTOSAVE_DEBOUNCE_MS } from '$lib/config';
	import type { CV } from '$lib/types/cv';
	import type { SaveStatus } from '$lib/types/save-status';
	import { toast } from 'svelte-sonner';
	import { computeBlockHashes } from '$lib/features/tailoring/hash';
	import { orphanTailored } from '$lib/features/tailoring/orphan';

	let cv = $state<CV | null>(null);
	let masterCv = $state<CV | undefined>(undefined);
	let saveStatus = $state<SaveStatus>({ status: 'idle' });

	onMount(async () => {
		const id = page.params.id;
		const loaded = await db.cvs.get(id);
		if (!loaded) {
			goto(resolve('/'));
			return;
		}
		cv = loaded;

		if (loaded.sourceId) {
			const source = await db.cvs.get(loaded.sourceId);
			if (!source) {
				const orphaned = orphanTailored(loaded);
				await db.cvs.put(orphaned);
				cv = orphaned;
				toast.info('The master for this CV was deleted. It is now a standalone CV.');
			} else {
				masterCv = source;
			}
		}
	});

	$effect(() => {
		if (!cv) return;
		const snapshot = $state.snapshot(cv) as CV;

		const timer = setTimeout(async () => {
			saveStatus = { status: 'saving' };
			try {
				await db.cvs.put({
					...snapshot,
					updatedAt: Date.now(),
					blockHashes: computeBlockHashes(snapshot.blocks)
				});
				saveStatus = { status: 'saved', savedAt: Date.now() };
			} catch (err) {
				saveStatus = { status: 'idle' };
				toast.error('Auto-save failed. Changes not saved.');
				console.error('Auto-save error:', err);
			}
		}, AUTOSAVE_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	});

	function onEdit(updated: CV) {
		cv = updated;
	}
</script>

<svelte:head>
	<title>{cv?.name ? `${cv.name} - HumbleHire` : 'HumbleHire'}</title>
</svelte:head>

<CvEditor {cv} {saveStatus} {masterCv} {onEdit} />
