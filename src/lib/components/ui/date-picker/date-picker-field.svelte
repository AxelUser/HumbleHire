<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import type { DateValue } from '@internationalized/date';
	import { cn } from '$lib/utils.js';

	interface Props {
		value: Date | undefined;
		placeholder?: string;
		class?: string;
	}

	let { value = $bindable(), placeholder = 'Select date', class: className = '' }: Props = $props();

	let open = $state(false);

	const df = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});

	function toCalendarDate(date: Date | undefined): CalendarDate | undefined {
		if (!date) return undefined;
		return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
	}

	let calendarValue = $state<CalendarDate | undefined>(toCalendarDate(value));

	function onValueChange(v: DateValue | undefined) {
		if (v) {
			value = new Date(Date.UTC(v.year, v.month - 1, v.day));
			calendarValue = new CalendarDate(v.year, v.month, v.day);
		}
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				size="sm"
				class={cn(
					'justify-start gap-1.5 font-normal',
					!value && 'text-muted-foreground',
					className
				)}
			>
				<CalendarIcon class="size-3.5 shrink-0" />
				{value ? df.format(value) : placeholder}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto overflow-hidden p-0" align="start">
		<Calendar
			type="single"
			value={calendarValue}
			captionLayout="dropdown"
			{onValueChange}
			maxValue={today(getLocalTimeZone())}
		/>
	</Popover.Content>
</Popover.Root>
