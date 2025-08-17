<script lang="ts">
	import { onMount } from 'svelte';
	import { Subject } from 'rxjs';
	import { BackgroundSection } from './sections/background';
	import { TextSection } from './sections/texts';
	import { SkillsIconsSection } from './sections/skills';
	import { Separator } from '@ui/separator';

	interface Props {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		fontsLoaded: boolean;
		skillsIcons?: { id: string; texts: string[]; url: string }[];
	}

	let { ctx, width, height, fontsLoaded, skillsIcons = [] }: Props = $props();

	let redraw$ = new Subject<void>();

	let rafId: number | null = null;
	function scheduleRedraw() {
		if (rafId !== null) return;
		rafId = requestAnimationFrame(() => {
			rafId = null;
			redraw();
		});
	}

	function redraw() {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);
		redraw$.next();
	}

	function onChanged() {
		scheduleRedraw();
	}

	$effect(() => {
		width;
		height;
		ctx;
		scheduleRedraw();
	});

	onMount(async () => {
		scheduleRedraw();
	});
</script>

<div class="space-y-6">
	<BackgroundSection {ctx} {width} {height} {redraw$} {onChanged} />
	<Separator />

	<TextSection {ctx} {width} {height} {redraw$} {onChanged} {fontsLoaded} />
	<Separator />

	<SkillsIconsSection {ctx} {width} {height} {redraw$} {onChanged} {skillsIcons} />
</div>
