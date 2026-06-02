<script lang="ts">
	import { Search, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';

	interface Props {
		query: string;
		matchCount: number | null;
		masterCount: number;
		tailoredCount: number;
	}

	let { query = $bindable(''), matchCount, masterCount, tailoredCount }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && query) {
			e.preventDefault();
			query = '';
		}
	}
</script>

<div class="flex items-center gap-3">
	<InputGroup.Root class="border-foreground shadow-brutal-sm w-80 rounded-none border-2">
		<InputGroup.Addon align="inline-start">
			<Search class="text-muted-foreground h-3.5 w-3.5" />
		</InputGroup.Addon>
		<InputGroup.Input
			bind:value={query}
			placeholder="Search by name or company…"
			onkeydown={handleKeydown}
		/>
		{#if query}
			<InputGroup.Addon align="inline-end">
				<Button
					variant="ghost"
					size="sm"
					class="h-6 w-6 p-0"
					onclick={() => (query = '')}
					aria-label="Clear search"
				>
					<X class="h-3.5 w-3.5" />
				</Button>
			</InputGroup.Addon>
		{/if}
	</InputGroup.Root>
	<span class="flex-1"></span>
	<span class="text-muted-foreground font-mono text-[11px] font-bold tracking-wider uppercase">
		{#if matchCount !== null}
			{matchCount}
			{matchCount === 1 ? 'match' : 'matches'}
		{:else}
			{masterCount}
			{masterCount === 1 ? 'master' : 'masters'} · {tailoredCount} tailored
			{tailoredCount === 1 ? 'copy' : 'copies'}
		{/if}
	</span>
</div>
