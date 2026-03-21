<script lang="ts">
	import DatePickerField from '$lib/components/ui/date-picker/date-picker-field.svelte';

	interface Props {
		startValue?: Date | undefined;
	}

	let { startValue = undefined }: Props = $props();
	let value = $state<Date | undefined>(startValue);

	const df = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});
</script>

<div class="flex flex-col gap-2">
	<DatePickerField bind:value placeholder="Select date" />
	<span class="text-sm text-muted-foreground">
		Stored value: <code>{value ? df.format(value) : '(empty)'}</code>
	</span>
</div>
