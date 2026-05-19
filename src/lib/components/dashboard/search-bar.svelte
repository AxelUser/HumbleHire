<script lang="ts">
	import { Search } from '@lucide/svelte';

	interface Props {
		masterCount: number;
		tailoredCount: number;
	}

	let { masterCount, tailoredCount }: Props = $props();
</script>

<div class="flex items-center gap-3">
	<div
		class="border-foreground bg-card shadow-brutal-sm flex min-w-80 items-center gap-2 border-2 px-3 py-2"
	>
		<Search class="text-muted-foreground h-3.5 w-3.5 shrink-0" />
		<span class="text-muted-foreground text-sm font-medium"> Find by company, role, keyword… </span>
	</div>
	<span class="flex-1"></span>
	<span class="text-muted-foreground font-mono text-[11px] font-bold tracking-wider uppercase">
		{masterCount}
		{masterCount === 1 ? 'master' : 'masters'} · {tailoredCount} tailored
		{tailoredCount === 1 ? 'copy' : 'copies'}
	</span>
</div>
