<script lang="ts">
	import { Label } from '@ui/label';
	import * as Select from '@ui/select';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { Slider } from '@ui/slider';
	import { onMount, onDestroy } from 'svelte';
	import type { Observable, Subscription } from 'rxjs';

	type ColorMode = 'Solid' | 'Gradient';

	const colorModeOptions = new Map<ColorMode, string>([
		['Solid', 'Solid color'],
		['Gradient', 'Gradient color']
	]);

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		redraw$?: Observable<unknown>;
		onChanged?: () => void;
	}

	let { ctx, width, height, redraw$, onChanged }: Props = $props();

	let colorMode: ColorMode = $state('Solid');

	let solidColor = $state('#0ea5e9');
	let gradientFrom = $state('#0ea5e9');
	let gradientTo = $state('#6366f1');
	let gradientAngle = $state(45);

	export function renderBackground() {
		if (!ctx) return;
		if (colorMode === 'Solid') {
			ctx.fillStyle = solidColor;
			ctx.fillRect(0, 0, width, height);
		} else {
			const radians = (gradientAngle * Math.PI) / 180;
			const x = Math.cos(radians);
			const y = Math.sin(radians);
			const cx = width / 2;
			const cy = height / 2;
			const halfDiag = Math.sqrt(cx * cx + cy * cy);
			const x0 = cx - x * halfDiag;
			const y0 = cy - y * halfDiag;
			const x1 = cx + x * halfDiag;
			const y1 = cy + y * halfDiag;
			const grad = ctx.createLinearGradient(x0, y0, x1, y1);
			grad.addColorStop(0, gradientFrom);
			grad.addColorStop(1, gradientTo);
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, width, height);
		}
	}

	onMount(() => {
		let sub: Subscription | null = null;
		if (redraw$) {
			sub = redraw$.subscribe(() => {
				renderBackground();
			});
		}
		onDestroy(() => {
			sub?.unsubscribe();
		});
	});

	$effect(() => {
		colorMode;
		solidColor;
		gradientFrom;
		gradientTo;
		gradientAngle;
		onChanged?.();
	});
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="space-y-2">
		<Label for="mode">Background</Label>
		<Select.Root type="single" bind:value={colorMode}>
			<Select.Trigger
				data-placeholder="Select a color type"
				class="w-fit rounded-md border px-3 py-2"
			>
				{colorModeOptions.get(colorMode)}
			</Select.Trigger>
			<Select.Content>
				{#each colorModeOptions.entries() as [value, label]}
					<Select.Item {value} {label} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if colorMode === 'Solid'}
		<div class="mt-auto">
			<ColorPicker bind:hex={solidColor} name="solid" label="Choose a color" />
		</div>
	{:else}
		<div class="flex flex-wrap items-end gap-4">
			<div class="space-y-2">
				<ColorPicker bind:hex={gradientFrom} name="from" label="From" />
			</div>
			<div class="space-y-2">
				<ColorPicker bind:hex={gradientTo} name="to" label="To" />
			</div>
			<div class="min-w-1/2 space-y-2">
				<Label>Angle ({gradientAngle}°)</Label>
				<Slider type="single" bind:value={gradientAngle} min={0} max={360} step={1} />
			</div>
		</div>
	{/if}
</div>
