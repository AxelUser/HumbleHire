<script lang="ts">
	import { Label } from '@ui/label';
	import ColorPicker from 'svelte-awesome-color-picker';
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

	let solidColor = $state('#0ea5e9');

	function renderSolidColor() {
		if (!ctx) return;
		ctx.fillStyle = solidColor;
		ctx.fillRect(0, 0, width, height);
	}

	onMount(() => {
		const sub = redraw$.subscribe(renderSolidColor);
		return () => sub.unsubscribe();
	});

	$effect(() => {
		solidColor;
		width;
		height;
		onChanged();
	});
</script>

<div class="mt-auto">
	<ColorPicker bind:hex={solidColor} name="solid" label="Choose a color" />
</div>
