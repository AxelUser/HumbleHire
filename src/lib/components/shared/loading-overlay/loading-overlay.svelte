<script lang="ts">
	let { open = $bindable(false), label = 'Loading…' } = $props<{
		open?: boolean;
		label?: string;
	}>();
</script>

{#if open}
	<div class="bg-background/60 absolute inset-0 z-50 backdrop-blur-sm">
		<div class="flex h-full w-full items-center justify-center">
			<div class="flex flex-col items-center gap-3">
				<div
					class="border-muted-foreground/30 border-t-primary h-10 w-10 animate-spin rounded-full border-2"
				></div>
				<div class="text-muted-foreground text-sm">{label}</div>
			</div>
		</div>
	</div>
{/if}
