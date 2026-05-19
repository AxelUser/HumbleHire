<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	interface Field {
		label: string;
		before: string;
		after: string;
	}

	interface Props {
		fields: Field[];
	}

	let { fields }: Props = $props();
</script>

<div class="mt-2 flex flex-col gap-1.5 text-xs">
	{#each fields as field (field.label)}
		<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
			<span class="text-muted-foreground w-14 shrink-0 font-medium">{field.label}</span>
			<span class="flex flex-wrap items-baseline gap-x-1.5">
				<span class="text-muted-foreground decoration-destructive line-through">{field.before}</span
				>
				<ArrowRight class="text-muted-foreground size-3 self-center" />
				<span class="text-accent font-medium">{field.after}</span>
			</span>
		</div>
	{/each}
</div>
