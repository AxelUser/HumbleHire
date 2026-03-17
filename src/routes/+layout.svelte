<script lang="ts">
	import '../app.css';
	import { ModeWatcher, toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from '@lucide/svelte';
	import Header from '$lib/components/layout/header.svelte';
	import Footer from '$lib/components/layout/footer.svelte';

	let { children } = $props();
</script>

<ModeWatcher />

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>

<button
	onclick={toggleMode}
	class="fixed bottom-6 right-6 z-50 flex items-center gap-2 border-2 border-foreground bg-card px-3 py-2 text-sm font-bold shadow-brutal hover-brutal"
	aria-label="Toggle theme"
>
	{#if mode.current === 'dark'}
		<Sun class="h-4 w-4" />
		Light
	{:else}
		<Moon class="h-4 w-4" />
		Dark
	{/if}
</button>
