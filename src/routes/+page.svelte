<script lang="ts">
	import { SEO } from '$lib/components/shared/seo/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
	import { Button } from '@ui/button';
</script>

<SEO
	title="HumbleHire"
	description="A humble set of tools to make your job search less stressful"
/>

<section class="flex min-h-[60vh] items-center justify-center">
	<div class="fade-in mx-auto max-w-3xl space-y-6 text-center">
		<img
			src="/humble-hire-logo-521.png"
			alt="HumbleHire logo"
			class="mx-auto h-24 w-24 rounded-lg border shadow-sm"
		/>
		<h1 class="text-4xl font-bold tracking-tight md:text-5xl">HumbleHire</h1>
		<p class="text-muted-foreground text-base md:text-lg">
			A humble set of tools to make your job search less stressful: generate a LinkedIn banner and
			cover, and build resumes with Markdown.
		</p>

		<div class="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>LinkedIn Banner Generator</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<p class="text-muted-foreground text-sm">
						Create a polished banner that highlights your skills and experience.
					</p>
					<div class="flex justify-end">
						<Button href="/banner-generator">Open</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>LinkedIn Profile Cover</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<p class="text-muted-foreground text-sm">
						Design a distinctive profile image cover to stand out.
					</p>
					<div class="flex items-center justify-between">
						<span class="text-foreground/70 text-xs font-medium">Coming Soon</span>
						<Button variant="secondary" disabled>Open</Button>
					</div>
				</CardContent>
			</Card>

			<Card class="sm:col-span-2">
				<CardHeader>
					<CardTitle>Resume Builder (Markdown)</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<p class="text-muted-foreground text-sm">
						Craft and adapt your master resume using Markdown.
					</p>
					<div class="flex items-center justify-between">
						<span class="text-foreground/70 text-xs font-medium">Coming Soon</span>
						<Button variant="secondary" disabled>Open</Button>
					</div>
				</CardContent>
			</Card>
		</div>
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
