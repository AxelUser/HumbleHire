<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CreateCvActions } from '$lib/components/cv';
	import Schematic from './schematic.svelte';

	let { onCreate }: { onCreate: (id: string) => void } = $props();
</script>

<section class="border-foreground bg-card border-b-2 px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<div class="grid items-center gap-16 md:grid-cols-[1fr_380px]">
			<!-- Left: copy -->
			<div>
				<p class="text-muted-foreground mb-3 text-[11px] font-extrabold tracking-widest uppercase">
					↳ Free · Local-first · Open source
				</p>
				<h1 class="mb-5 text-5xl font-extrabold tracking-tight md:text-6xl">
					One CV. <em class="text-accent not-italic">Many targets.</em>
				</h1>
				<p class="text-muted-foreground mb-8 max-w-[520px] text-lg leading-relaxed font-medium">
					The CV manager built for the way real job hunts work. Keep one master CV with your whole
					record — branch tailored copies for each role, and pull master updates change-by-change.
					No account, no cloud.
				</p>

				<div class="flex flex-wrap items-center gap-3">
					<CreateCvActions
						{onCreate}
						source="hero"
						newCvLabel="Create your first CV"
						class="gap-3"
					/>
					<Button variant="outline" size="lg" href="#how">See how it works ↓</Button>
				</div>

				<div
					class="text-muted-foreground mt-6 flex flex-wrap gap-5 font-mono text-xs font-bold tracking-wider uppercase"
				>
					<span><span class="text-accent mr-1.5">✦</span>No signup</span>
					<span><span class="text-accent mr-1.5">✦</span>Free to use</span>
					<span><span class="text-accent mr-1.5">✦</span>Runs in your browser</span>
				</div>
			</div>

			<!-- Right: schematic -->
			<div class="hidden md:block">
				<Schematic />
			</div>
		</div>
	</div>
</section>
