<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { db } from '$lib/db/index';
	import { CvList, Hero, NewCvButton } from '$lib/components/dashboard';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		AlertDialog,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogCancel,
		AlertDialogAction
	} from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';

	import type { CV } from '$lib/types/cv';

	let cvs = $state<CV[]>([]);
	let loading = $state(true);

	let deleteTargetId = $state<string | null>(null);
	let deleteTargetDependents = $state<CV[]>([]);
	let deleteDialogOpen = $state(false);

	onMount(async () => {
		cvs = await db.cvs.orderBy('updatedAt').reverse().toArray();
		loading = false;
	});

	async function handleDelete(id: string) {
		const dependents = await db.cvs.where('sourceId').equals(id).toArray();
		if (dependents.length > 0) {
			deleteTargetId = id;
			deleteTargetDependents = dependents;
			deleteDialogOpen = true;
		} else {
			await db.cvs.delete(id);
			cvs = cvs.filter((cv) => cv.id !== id);
		}
	}

	async function handleDeleteWithDependents(action: 'delete-all' | 'keep-standalone') {
		if (!deleteTargetId) return;
		if (action === 'delete-all') {
			const ids = [deleteTargetId, ...deleteTargetDependents.map((d) => d.id)];
			await db.cvs.bulkDelete(ids);
			cvs = cvs.filter((cv) => !ids.includes(cv.id));
		} else {
			for (const dep of deleteTargetDependents) {
				await db.cvs.update(dep.id, { sourceId: undefined, syncDecisions: undefined });
			}
			await db.cvs.delete(deleteTargetId);
			cvs = cvs.filter((cv) => cv.id !== deleteTargetId);
			cvs = cvs.map((cv) =>
				deleteTargetDependents.some((d) => d.id === cv.id)
					? { ...cv, sourceId: undefined, syncDecisions: undefined }
					: cv
			);
		}
		deleteDialogOpen = false;
		deleteTargetId = null;
		deleteTargetDependents = [];
	}

	function handleCreate(id: string) {
		goto(resolve(`/cv/${id}`));
	}

	function handleTailor(id: string) {
		goto(resolve(`/cv/${id}`));
	}

	async function handleSync(updated: CV) {
		const persisted = { ...updated, updatedAt: Date.now(), version: (updated.version ?? 0) + 1 };
		await db.cvs.put(persisted);
		cvs = cvs.map((cv) => (cv.id === persisted.id ? persisted : cv));
	}
</script>

<svelte:head>
	<title>HumbleHire</title>
</svelte:head>

<Hero />

<div class="px-6 py-10">
	<div class="mx-auto flex max-w-5xl flex-col gap-6">
		<div
			class="border-foreground bg-card shadow-brutal flex items-center justify-between border-2 px-6 py-4"
		>
			<div>
				<p class="text-accent text-xs font-bold tracking-widest uppercase">↳ Your CVs</p>
				<h2 class="text-2xl font-extrabold tracking-tight">Dashboard</h2>
			</div>
			<NewCvButton onCreate={handleCreate} />
		</div>

		{#if loading}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each { length: 3 } as _, i (i)}
					<Skeleton class="h-48 w-full rounded-none" />
				{/each}
			</div>
		{:else}
			<CvList {cvs} onDelete={handleDelete} onTailor={handleTailor} onSync={handleSync} />
		{/if}
	</div>
</div>

<!-- Delete master CV dialog -->
<AlertDialog bind:open={deleteDialogOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>This CV has tailored copies</AlertDialogTitle>
			<AlertDialogDescription>
				This CV has {deleteTargetDependents.length} tailored cop{deleteTargetDependents.length === 1
					? 'y'
					: 'ies'}. What would you like to do?
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter class="flex-col gap-2 sm:flex-row">
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<Button variant="outline" onclick={() => handleDeleteWithDependents('keep-standalone')}>
				Keep as standalone
			</Button>
			<AlertDialogAction onclick={() => handleDeleteWithDependents('delete-all')}>
				Delete all
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

