<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { db } from '$lib/db/index';
	import { getHasCvsHint } from '$lib/services/cv/has-cvs-hint';
	import { Hero, About } from '$lib/components/landing';
	import { Dashboard } from '$lib/components/dashboard';

	let mode = $state<'hero' | 'dashboard'>(getHasCvsHint() ? 'dashboard' : 'hero');

	onMount(async () => {
		const count = await db.cvs.count();
		const actual = count > 0 ? 'dashboard' : 'hero';
		if (actual !== mode) mode = actual;
	});

	function handleCreate(id: string) {
		goto(resolve(`/cv/${id}`));
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
	<Hero onCreate={handleCreate} />
{:else}
	<Dashboard />
{/if}

<About />
