<script lang="ts">
	import { Header } from '$lib/components/shared/header';
	import { Footer } from '$lib/components/shared/footer';
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<Header />
	<main class="container mx-auto px-4 py-6 flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
