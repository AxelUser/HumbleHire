<script lang="ts">
	import { page } from '$app/state';
	import { mode } from 'mode-watcher';
</script>

<header class="sticky top-0 z-20 border-b-2 border-foreground bg-card px-6 py-3">
	<div class="mx-auto flex max-w-5xl items-center justify-between">
		<a href="/" class="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
			<img src={mode.current === 'dark' ? '/logo/humblehire_logo_dark.avif' : '/logo/humblehire_logo_light.avif'} alt="HumbleHire" class="h-10 w-auto" />
			<span>Humble<span class="text-accent">Hire</span></span>
		</a>

		{#if page.url.pathname !== '/'}
			<a
				href="/"
				class="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1.5 text-sm font-bold shadow-brutal-sm hover-brutal"
			>
				← Dashboard
			</a>
		{/if}
	</div>
</header>
