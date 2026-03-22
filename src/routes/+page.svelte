<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { db } from '$lib/db/index';
	import { CvList, Hero, NewCvButton } from '$lib/components/dashboard';
	import { Skeleton } from '$lib/components/ui/skeleton';

	import type { CV } from '$lib/types/cv';

	let cvs = $state<CV[]>([]);
	let loading = $state(true);

	onMount(async () => {
		cvs = await db.cvs.orderBy('updatedAt').reverse().toArray();
		loading = false;
	});

	async function handleDelete(id: string) {
		await db.cvs.delete(id);
		cvs = cvs.filter((cv) => cv.id !== id);
	}

	function handleCreate(id: string) {
		goto(resolve(`/cv/${id}`));
	}
</script>

<svelte:head>
	<title>HumbleHire</title>
</svelte:head>

<Hero />

<!-- Dashboard content -->
<div class="px-6 py-10">
	<div class="mx-auto flex max-w-5xl flex-col gap-6">
		<!-- Toolbar bar -->
		<div
			class="border-foreground bg-card shadow-brutal flex items-center justify-between border-2 px-6 py-4"
		>
			<div>
				<p class="text-accent text-xs font-bold tracking-widest uppercase">↳ Your CVs</p>
				<h2 class="text-2xl font-extrabold tracking-tight">Dashboard</h2>
			</div>
			<NewCvButton onCreate={handleCreate} />
		</div>

		<!-- CV grid -->
		{#if loading}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each { length: 3 } as _, i (i)}
					<Skeleton class="h-48 w-full rounded-none" />
				{/each}
			</div>
		{:else}
			<CvList {cvs} onDelete={handleDelete} />
		{/if}
	</div>
</div>
