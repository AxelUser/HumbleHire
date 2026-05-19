<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { db } from '$lib/db/index';
	import { Button } from '$lib/components/ui/button';
	import { Wrench, X } from '@lucide/svelte';
	import { createDummyCV } from './dummy-cv';

	let expanded = $state(false);
	let busy = $state(false);

	async function seedFullCv() {
		if (busy) return;
		busy = true;
		try {
			const cv = createDummyCV();
			await db.cvs.add(cv);
			await goto(resolve(`/cv/${cv.id}`));
		} finally {
			busy = false;
		}
	}
</script>

{#if expanded}
	<div
		class="border-foreground bg-card shadow-brutal fixed bottom-6 left-6 z-50 flex w-60 flex-col gap-3 border-2 p-3"
	>
		<div class="flex items-center justify-between">
			<span class="text-xs font-extrabold tracking-widest uppercase">Dev Toolbox</span>
			<button
				onclick={() => (expanded = false)}
				aria-label="Close dev toolbox"
				class="hover:text-accent"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
		<Button variant="outline" size="sm" disabled={busy} onclick={seedFullCv}>
			{busy ? 'Seeding…' : 'Seed full CV'}
		</Button>
	</div>
{:else}
	<button
		onclick={() => (expanded = true)}
		class="border-foreground bg-card shadow-brutal hover-brutal fixed bottom-6 left-6 z-50 flex items-center gap-2 border-2 px-3 py-2 text-sm font-bold"
		aria-label="Open dev toolbox"
	>
		<Wrench class="h-4 w-4" />
		DEV
	</button>
{/if}
