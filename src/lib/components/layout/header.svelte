<script lang="ts">
	import { page } from '$app/state';
	import { Logo } from '$lib/components/ui/logo';
</script>

<header class="border-foreground bg-card sticky top-0 z-20 border-b-2 px-6 py-3">
	<div class="mx-auto flex max-w-5xl items-center justify-between">
		<a href="/" class="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
			<Logo class="h-10 w-auto" />
			<span>Humble<span class="text-accent">Hire</span></span>
		</a>

		{#if page.url.pathname !== '/'}
			<a
				href="/"
				class="border-foreground bg-background shadow-brutal-sm hover-brutal inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-bold"
			>
				← Dashboard
			</a>
		{/if}
	</div>
</header>
