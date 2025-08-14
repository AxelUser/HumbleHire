<script lang="ts">
	import { Header } from '$lib/components/shared/header';
	import { Footer } from '$lib/components/shared/footer';
	import '../app.css';
	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="container mx-auto flex-1 px-4 py-6">
		{@render children()}
	</main>
	<Footer />
</div>
