<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { ModeWatcher, toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from '@lucide/svelte';
	import Header from '$lib/components/layout/header.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	import DevToolbox from '$lib/components/dev/dev-toolbox.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { initAnalytics } from '$lib/analytics';
	import { pwaInstall } from '$lib/pwa/install.svelte';
	import { notifyUpdate } from '$lib/pwa/reload-toast';

	let { children } = $props();

	onMount(() => {
		initAnalytics();
		pwaInstall.init();

		if (import.meta.env.VITE_E2E) {
			import('$lib/e2e-bridge').then((m) => m.initE2eBridge());
			return;
		}

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js', { type: dev ? 'module' : 'classic' })
				.then((reg) => {
					if (reg.waiting) {
						const waiting = reg.waiting;
						notifyUpdate(() => waiting.postMessage({ type: 'SKIP_WAITING' }));
					}

					reg.addEventListener('updatefound', () => {
						const worker = reg.installing;
						if (!worker) return;
						worker.addEventListener('statechange', () => {
							if (worker.state === 'installed' && navigator.serviceWorker.controller) {
								notifyUpdate(() => worker.postMessage({ type: 'SKIP_WAITING' }));
							}
						});
					});
				});

			navigator.serviceWorker.addEventListener('controllerchange', () => {
				window.location.reload();
			});
		}
	});
</script>

<ModeWatcher />
<Toaster />

<div class="flex h-screen flex-col">
	<Header />
	<main class="min-h-0 flex-1 overflow-y-auto">
		{@render children()}
	</main>
	<Footer />
</div>

<button
	onclick={toggleMode}
	class="border-foreground bg-card shadow-brutal hover-brutal fixed right-6 bottom-6 z-50 flex items-center gap-2 border-2 px-3 py-2 text-sm font-bold"
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

{#if dev}
	<DevToolbox />
{/if}
