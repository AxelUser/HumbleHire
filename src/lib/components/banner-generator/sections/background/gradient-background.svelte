<script lang="ts">
	import { Label } from '@ui/label';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { Slider } from '@ui/slider';
	import { onMount } from 'svelte';
	import type { Observable } from 'rxjs';

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		redraw$: Observable<unknown>;
		onChanged: () => void;
	}

	let { ctx, width, height, redraw$, onChanged }: Props = $props();

	let gradientFrom = $state('#0ea5e9');
	let gradientTo = $state('#6366f1');
	let gradientAngle = $state(45);

	function renderGradientColor() {
		if (!ctx) return;
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

	onMount(() => {
		const sub = redraw$.subscribe(renderGradientColor);
		return () => sub.unsubscribe();
	});

	$effect(() => {
		gradientFrom;
		gradientTo;
		gradientAngle;
		width;
		height;
		onChanged();
	});
</script>

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
