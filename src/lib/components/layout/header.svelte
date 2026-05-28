<script lang="ts">
	import { page } from '$app/state';
	import { Logo } from '$lib/components/ui/logo';
	import { ExternalLink } from '@lucide/svelte';

	const isHome = $derived(page.url.pathname === '/');
</script>

<header class="border-foreground bg-card sticky top-0 z-20 border-b-2">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
		<a href="/" class="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
			<Logo class="h-10 w-auto" />
			<span>Humble<span class="text-accent">Hire</span></span>
		</a>

		{#if isHome}
			<nav class="hidden items-center gap-6 text-sm font-bold md:flex">
				<a href="#about" class="hover:text-accent transition-colors">About</a>
				<a href="#how" class="hover:text-accent transition-colors">How it works</a>
				<a href="#faq" class="hover:text-accent transition-colors">FAQ</a>
				<a
					href="https://github.com/AxelUser/HumbleHire"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:text-accent flex items-center gap-1 transition-colors"
				>
					GitHub <ExternalLink class="h-3 w-3" />
				</a>
			</nav>
		{:else}
			<a
				href="/"
				class="border-foreground bg-background shadow-brutal-sm hover-brutal inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-bold"
			>
				← Dashboard
			</a>
		{/if}
	</div>
</header>
