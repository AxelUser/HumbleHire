<script lang="ts">
	import { SEO } from '$lib/components/shared/seo/index.js';
</script>

<SEO
	title="HumbleHire"
	description="A humble set of tools to make your job search less stressful"
/>

<section class="flex min-h-[60vh] items-center justify-center">
	<div class="fade-in mx-auto max-w-2xl space-y-4 text-center">
		<h1 class="text-4xl font-bold tracking-tight md:text-5xl">HumbleHire</h1>
		<p class="text-muted-foreground text-base md:text-lg">
			A humble set of tools to make your job search less stressful: generate a LinkedIn banner and
			cover, and build resumes with Markdown.
		</p>
	</div>
</section>

<style>
	.fade-in {
		animation: fadeIn 400ms ease-out both;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
