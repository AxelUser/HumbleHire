<script lang="ts">
	import * as Input from '@ui/input';
	import { cn } from '$lib/utils.js';

	type Props = {
		value?: string;
		class?: string;
		id?: string;
		name?: string;
		disabled?: boolean;
		required?: boolean;
		placeholder?: string;
	};

	let {
		value = $bindable('#000000'),
		class: className,
		id,
		name,
		disabled = false,
		required = false,
		placeholder = '#000000',
		...rest
	}: Props = $props();

	let hex = $state(value);
	let colorValue = $state(toFull6(isValidHex(value) ? value : '#000000'));

	$effect(() => {
		if (value !== hex && isValidHex(value)) {
			hex = value;
		}
	});

	$effect(() => {
		colorValue = toFull6(isValidHex(hex) ? hex : '#000000');
	});

	function isValidHex(input: string): boolean {
		return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(input);
	}

	function toFull6(input: string): string {
		if (!input.startsWith('#')) return '#000000';
		const raw = input.slice(1);
		if (raw.length === 3) {
			const [r, g, b] = raw;
			return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
		}
		return `#${raw.substring(0, 6)}`.toUpperCase();
	}

	function normalizeHex(input: string): string {
		let out = input.trim();
		if (!out.startsWith('#')) out = '#' + out;
		out = out.replace(/[^#0-9A-Fa-f]/g, '');
		if (out.length > 7) out = out.slice(0, 7);
		return out;
	}

	function onColorInput(e: Event) {
		const target = e.target as HTMLInputElement;
		colorValue = target.value.toUpperCase();
		hex = colorValue;
		value = colorValue;
	}

	function onTextInput(e: Event) {
		const target = e.target as HTMLInputElement;
		hex = normalizeHex(target.value);
		if (isValidHex(hex)) {
			value = toFull6(hex);
		}
	}
</script>

<div class={cn('flex items-center gap-2', className)}>
	<input
		type="color"
		class="border-input bg-background h-9 w-9 shrink-0 cursor-pointer rounded-md border p-0 shadow-xs"
		bind:value={colorValue}
		{disabled}
		{required}
		oninput={onColorInput}
	/>
	<Input.Root
		{id}
		{name}
		{disabled}
		{required}
		{placeholder}
		value={hex}
		aria-invalid={!isValidHex(hex)}
		type="text"
		oninput={onTextInput}
		{...rest}
	/>
</div>
