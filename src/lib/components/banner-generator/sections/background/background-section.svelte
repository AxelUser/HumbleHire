<script lang="ts">
	import { Label } from '@ui/label';
	import * as Select from '@ui/select';
	import { onMount } from 'svelte';
	import { Subject, type Observable } from 'rxjs';
	import SolidBackground from './solid-background.svelte';
	import GradientBackground from './gradient-background.svelte';
	import ImageBackground from './image-background.svelte';

	type BackgroundMode = 'Solid' | 'Gradient' | 'Image';

	const bgModeOptions = new Map<BackgroundMode, string>([
		['Solid', 'Solid color'],
		['Gradient', 'Gradient color'],
		['Image', 'Image']
	]);

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		redraw$: Observable<unknown>;
		onChanged: () => void;
	}

	let { ctx, width, height, redraw$, onChanged }: Props = $props();

	let bgMode: BackgroundMode = $state('Solid');

	let bgRedraw$ = new Subject<void>();

	onMount(() => {
		const sub = redraw$.subscribe(() => {
			bgRedraw$.next();
		});
		return () => sub.unsubscribe();
	});

	$effect(() => {
		bgMode;
		onChanged();
	});
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="space-y-2">
		<Label for="mode">Background</Label>
		<Select.Root type="single" bind:value={bgMode}>
			<Select.Trigger
				data-placeholder="Select a color type"
				class="w-fit rounded-md border px-3 py-2"
			>
				{bgModeOptions.get(bgMode)}
			</Select.Trigger>
			<Select.Content>
				{#each bgModeOptions.entries() as [value, label]}
					<Select.Item {value} {label} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if bgMode === 'Solid'}
		<SolidBackground {ctx} {width} {height} redraw$={bgRedraw$} {onChanged} />
	{:else if bgMode === 'Gradient'}
		<GradientBackground {ctx} {width} {height} redraw$={bgRedraw$} {onChanged} />
	{:else}
		<ImageBackground {ctx} {width} {height} redraw$={bgRedraw$} {onChanged} />
	{/if}
</div>
