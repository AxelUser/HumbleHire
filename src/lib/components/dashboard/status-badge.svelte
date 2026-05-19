<script lang="ts">
	interface Props {
		updatesAvailable: boolean;
	}

	let { updatesAvailable }: Props = $props();
</script>

<span class="inline-flex items-center gap-1.5">
	<span
		class="border-foreground h-2 w-2 shrink-0 border-2 {updatesAvailable
			? 'bg-accent'
			: 'bg-muted-foreground'}"
	></span>
	<span
		class="font-mono text-[11px] font-bold tracking-[0.04em] uppercase {updatesAvailable
			? 'text-accent'
			: 'text-muted-foreground'}"
	>
		{updatesAvailable ? 'master updated' : 'in sync'}
	</span>
</span>
