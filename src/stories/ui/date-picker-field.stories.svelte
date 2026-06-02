<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DatePickerField from '$lib/components/ui/date-picker/date-picker-field.svelte';
	import DatePickerFieldWrapper from './helpers/DatePickerFieldWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/DatePickerField',
		component: DatePickerField,
		tags: ['autodocs']
	});
</script>

<Story name="Empty" asChild>
	<DatePickerField value={undefined} placeholder="Select date" />
</Story>

<Story name="With Value" asChild>
	<DatePickerField value={new Date(Date.UTC(2024, 0, 11))} placeholder="Select date" />
</Story>

<Story name="Date Range" asChild>
	<div class="flex items-center gap-2">
		<DatePickerField value={new Date(Date.UTC(2021, 0, 1))} placeholder="Start date" />
		<span class="text-muted-foreground">–</span>
		<DatePickerField value={new Date(Date.UTC(2024, 2, 1))} placeholder="End date" />
	</div>
</Story>

<Story name="Interactive" asChild>
	<DatePickerFieldWrapper />
</Story>

<Story name="Interactive with Initial Value" asChild>
	<DatePickerFieldWrapper startValue={new Date(Date.UTC(2019, 5, 1))} />
</Story>
