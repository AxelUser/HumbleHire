<script lang="ts">
	import { page } from '$app/state';
</script>

<header class="sticky top-0 z-20 border-b-2 border-foreground bg-card px-6 py-3">
	<div class="mx-auto flex max-w-5xl items-center justify-between">
		<a href="/" class="flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
			<span>◈</span>
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
