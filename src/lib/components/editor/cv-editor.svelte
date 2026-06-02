<script lang="ts">
	import { onMount } from 'svelte';
	import { PersistedState } from 'runed';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import type { CV } from '$lib/types/cv';
	import type { SaveStatus } from '$lib/types/save-status';
	import { ZOOM_DEFAULT } from '$lib/types/zoom';
	import type { ZoomState } from '$lib/types/zoom';
	import CvEditorToolbar from './cv-editor-toolbar.svelte';
	import CvEditorControls from './cv-editor-controls.svelte';
	import PdfPreviewPane from './pdf-preview-pane.svelte';

	interface Props {
		cv: CV | null;
		saveStatus: SaveStatus;
		masterCv?: CV;
		onEdit: (cv: CV) => void;
	}

	let { cv: cvProp, saveStatus, masterCv, onEdit }: Props = $props();

	const zoomPref = new PersistedState<ZoomState>('pdf-preview-zoom-v1', ZOOM_DEFAULT);

	let internalCv = $state<CV | null>(null);
	let previewOpen = $state(false);
	let innerWidth = $state(0);

	const isLarge = $derived(innerWidth >= 1024);

	// seed from prop once; user edits live in internalCv
	$effect(() => {
		if (cvProp !== null && internalCv === null) {
			internalCv = cvProp;
		}
	});

	// Notify parent of edits. Fires once on init (same data as loaded — benign extra save).
	let editReady = false;
	onMount(() => {
		editReady = true;
	});

	$effect(() => {
		if (!internalCv) return;
		const snapshot = $state.snapshot(internalCv);
		// editReady is a plain var, not a reactive dep — effect only tracks internalCv
		if (!editReady) return;
		onEdit(snapshot as CV);
	});
</script>

<svelte:window bind:innerWidth />

{#if internalCv === null}
	<div class="mx-auto max-w-5xl space-y-4 px-6 py-10">
		<Skeleton class="h-12 w-full" />
		<Skeleton class="h-64 w-full" />
		<Skeleton class="h-32 w-full" />
	</div>
{:else}
	<div class="flex h-full flex-col">
		<CvEditorToolbar
			bind:cvName={internalCv.name}
			cv={internalCv}
			{saveStatus}
			{masterCv}
			bind:previewOpen
			onSync={(updated) => (internalCv = updated)}
		/>

		<div class="flex min-h-0 flex-1 overflow-hidden px-6">
			<!-- Editor controls (left column) -->
			<div class="w-[560px] shrink-0 overflow-y-auto">
				<CvEditorControls bind:cv={internalCv} />
			</div>

			<!-- PDF preview pane (desktop ≥lg) -->
			{#if isLarge}
				<div class="border-foreground flex-1 overflow-hidden border-l-2">
					<PdfPreviewPane cv={internalCv} bind:zoomState={zoomPref.current} />
				</div>
			{/if}
		</div>

		<!-- Mobile preview drawer (< lg) -->
		{#if !isLarge}
			<Drawer direction="right" bind:open={previewOpen}>
				<DrawerContent class="flex flex-col overflow-hidden">
					<DrawerHeader class="shrink-0">
						<DrawerTitle>PDF Preview</DrawerTitle>
					</DrawerHeader>
					<div class="flex-1 overflow-y-auto">
						{#if previewOpen}
							<PdfPreviewPane cv={internalCv} bind:zoomState={zoomPref.current} />
						{/if}
					</div>
				</DrawerContent>
			</Drawer>
		{/if}
	</div>
{/if}
