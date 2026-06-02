<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { db } from '$lib/db/index';
	import { createCVFromTemplate } from '$lib/services/cv/create';
	import { getHasCvsHint } from '$lib/services/cv/has-cvs-hint';
	import { Hero, About } from '$lib/components/landing';
	import { Dashboard } from '$lib/components/dashboard';
	import { capture } from '$lib/analytics';

	let mode = $state<'hero' | 'dashboard'>(getHasCvsHint() ? 'dashboard' : 'hero');

	onMount(async () => {
		const count = await db.cvs.count();
		const actual = count > 0 ? 'dashboard' : 'hero';
		if (actual !== mode) mode = actual;
	});

	async function handleCreateFirstCv() {
		const id = crypto.randomUUID();
		const cv = createCVFromTemplate(id, 'Untitled CV');
		await db.cvs.add(cv);
		capture('cv_created', { source: 'hero' });
		await goto(resolve(`/cv/${id}`));
	}
</script>

<svelte:head>
	<title>HumbleHire — One CV. Many targets.</title>
	<meta
		name="description"
		content="Free, local-first CV manager. One master CV, tailored copies per role, selective master→tailored sync. No account, no cloud."
	/>
</svelte:head>

{#if mode === 'hero'}
	<Hero onCreateCv={handleCreateFirstCv} />
{:else}
	<Dashboard />
{/if}

<About />
