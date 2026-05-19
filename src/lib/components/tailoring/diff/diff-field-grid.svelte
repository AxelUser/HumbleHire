<script lang="ts">
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

<div class="mt-2 flex flex-col gap-2">
	{#each fields as field (field.label)}
		<div>
			<span class="text-muted-foreground text-xs font-medium">{field.label}</span>
			<div class="mt-1 grid grid-cols-2 gap-2 text-xs">
				<div class="rounded bg-red-50 p-2 dark:bg-red-950/30">
					<span class="text-muted-foreground mb-1 block font-medium">Before</span>
					<span class="text-foreground">{field.before}</span>
				</div>
				<div class="rounded bg-green-50 p-2 dark:bg-green-950/30">
					<span class="text-muted-foreground mb-1 block font-medium">After</span>
					<span class="text-foreground">{field.after}</span>
				</div>
			</div>
		</div>
	{/each}
</div>
