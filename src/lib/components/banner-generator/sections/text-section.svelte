<script lang="ts">
	import { Label } from '@ui/label';
	import ColorPicker from 'svelte-awesome-color-picker';
	import Input from '@ui/input/input.svelte';
	import * as ToggleGroup from '@ui/toggle-group';
	import * as Select from '@ui/select';
	import { Slider } from '@ui/slider';
	import { onMount, onDestroy } from 'svelte';
	import type { Observable, Subscription } from 'rxjs';
	import { loadableFontFamilies } from '../fonts';

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		redraw$: Observable<unknown>;
		onChanged: () => void;
		fontsLoaded: boolean;
	}

	let { ctx, width, height, redraw$, onChanged, fontsLoaded }: Props = $props();

	const CANVAS_PADDING = 48;

	type FontFamily = (typeof loadableFontFamilies)[number] | 'system-ui' | 'serif' | 'monospace';

	let fontFamily: FontFamily = $state('"JetBrains Mono"');
	const fontOptionsObj = {
		Inter: 'Inter',
		Roboto: 'Roboto',
		Montserrat: 'Montserrat',
		Poppins: 'Poppins',
		'"Playfair Display"': 'Playfair Display',
		Merriweather: 'Merriweather',
		'"JetBrains Mono"': 'JetBrains Mono',
		'system-ui': 'System UI',
		serif: 'Serif',
		monospace: 'Monospace'
	} as const satisfies Record<FontFamily, string>;
	const fontOptions = new Map<FontFamily, string>(
		Object.entries(fontOptionsObj) as [FontFamily, string][]
	);

	let title = $state('John Doe');
	let titleToggles = $state<string[]>(['bold']);
	let titleWeight = $derived<'normal' | 'bold'>(titleToggles.includes('bold') ? 'bold' : 'normal');
	let titleStyle = $derived<'normal' | 'italic'>(
		titleToggles.includes('italic') ? 'italic' : 'normal'
	);
	let titleColor = $state('#f9f9f9');
	let titleSize = $state(64);

	let subtitle = $state('Software Engineer');
	let subtitleToggles = $state<string[]>([]);
	let subtitleWeight = $derived<'normal' | 'bold'>(
		subtitleToggles.includes('bold') ? 'bold' : 'normal'
	);
	let subtitleStyle = $derived<'normal' | 'italic'>(
		subtitleToggles.includes('italic') ? 'italic' : 'normal'
	);
	let subtitleColor = $state('#e5e7eb');
	let subtitleSize = $state(32);

	let titleSubtitleGap = $state(12);

	export function renderText() {
		if (!ctx) return;
		ctx.textBaseline = 'top';
		ctx.textAlign = 'right';

		const padding = CANVAS_PADDING;
		const titleX = width - padding;
		const titleY = padding;

		ctx.fillStyle = titleColor;
		const titleFontWeight = titleWeight === 'bold' ? '700' : '400';
		ctx.font = `${titleStyle} ${titleFontWeight} ${titleSize}px ${fontFamily}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
		if (title) ctx.fillText(title, titleX, titleY, width * 0.8);

		const subtitleY = titleY + titleSize + titleSubtitleGap;
		ctx.fillStyle = subtitleColor;
		const subtitleFontWeight = subtitleWeight === 'bold' ? '700' : '400';
		ctx.font = `${subtitleStyle} ${subtitleFontWeight} ${subtitleSize}px ${fontFamily}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`;
		if (subtitle) ctx.fillText(subtitle, titleX, subtitleY, width * 0.8);
	}

	let sub: Subscription | null = null;

	onMount(() => {
		sub = redraw$.subscribe(renderText);
		return () => {
			sub?.unsubscribe();
		};
	});

	$effect(() => {
		fontsLoaded;
		title;
		titleColor;
		titleSize;
		titleStyle;
		titleWeight;
		subtitle;
		subtitleColor;
		subtitleSize;
		subtitleStyle;
		subtitleWeight;
		fontFamily;
		width;
		height;
		titleSubtitleGap;
		onChanged();
	});
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<Label for="font">Font</Label>
			<Select.Root type="single" bind:value={fontFamily}>
				<Select.Trigger data-placeholder="Select a font" class="w-fit rounded-md border px-3 py-2">
					{fontOptions.get(fontFamily)}
				</Select.Trigger>
				<Select.Content>
					{#each fontOptions.entries() as [value, label]}
						<Select.Item {value} {label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="flex flex-col space-y-2">
			<Label>Title</Label>
			<div class="flex items-center gap-2">
				<ColorPicker bind:hex={titleColor} name="titleColor" label="" />
				<Input id="title" placeholder="e.g. your name" bind:value={title} />
				<ToggleGroup.Root type="multiple" variant="outline" bind:value={titleToggles}>
					<ToggleGroup.Item value="bold" aria-label="Toggle bold">
						<strong>B</strong>
					</ToggleGroup.Item>
					<ToggleGroup.Item value="italic" aria-label="Toggle italic">
						<em>I</em>
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>
		</div>
		<div class="space-y-2">
			<Label for="titleSize">Size</Label>
			<Input id="titleSize" class="w-16" type="number" min="10" max="200" bind:value={titleSize} />
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="flex flex-col space-y-2">
			<Label>Subtitle</Label>
			<div class="flex items-center gap-2">
				<ColorPicker bind:hex={subtitleColor} name="subtitleColor" label="" />
				<Input id="subtitle" placeholder="e.g. your role" bind:value={subtitle} />
				<ToggleGroup.Root type="multiple" variant="outline" bind:value={subtitleToggles}>
					<ToggleGroup.Item value="bold" aria-label="Toggle bold">
						<strong>B</strong>
					</ToggleGroup.Item>
					<ToggleGroup.Item value="italic" aria-label="Toggle italic">
						<em>I</em>
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>
		</div>
		<div class="space-y-2">
			<Label for="subtitleSize">Size</Label>
			<Input
				id="subtitleSize"
				class="w-16"
				type="number"
				min="10"
				max="200"
				bind:value={subtitleSize}
			/>
		</div>
	</div>

	<div class="max-w-sm space-y-4">
		<Label>Title / Subtitle Spacing ({titleSubtitleGap}px)</Label>
		<Slider type="single" bind:value={titleSubtitleGap} min={0} max={200} step={1} />
	</div>
</div>
