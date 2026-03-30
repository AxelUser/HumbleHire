<script lang="ts">
	import type { CV } from '$lib/types/cv';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import {
		AlertDialog,
		AlertDialogTrigger,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogCancel,
		AlertDialogAction
	} from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Eye, Trash2, Scissors, RefreshCw } from '@lucide/svelte';
	import { hasUpdatesAvailable } from '$lib/features/tailoring/detection';
	import { TailorModal } from '$lib/components/dashboard';

	interface Props {
		cv: CV;
		allCvs: CV[];
		onDelete: (id: string) => void;
		onTailor: (id: string) => void;
		onSync: (cv: CV) => void;
	}

	let { cv, allCvs, onDelete, onTailor, onSync }: Props = $props();

	let tailorModalOpen = $state(false);

	const masterCv = $derived(
		cv.sourceId ? allCvs.find((c) => c.id === cv.sourceId) : undefined
	);

	const updatesAvailable = $derived(
		masterCv ? hasUpdatesAvailable(masterCv, cv) : false
	);
</script>

<Card>
	<CardHeader>
		<div class="flex items-start justify-between gap-2">
			<CardTitle>{cv.name}</CardTitle>
			{#if updatesAvailable}
				<Badge variant="secondary" class="shrink-0 text-xs">Updates available</Badge>
			{/if}
		</div>
		{#if cv.sourceId}
			<p class="text-muted-foreground text-xs">
				Tailored from: {masterCv?.name ?? 'Deleted CV'}
			</p>
		{/if}
	</CardHeader>
	<CardDescription class="px-6 pb-2">
		Last edited: {new Date(cv.updatedAt).toLocaleDateString()}
	</CardDescription>
	<CardFooter class="flex flex-wrap gap-2">
		<Button href="/cv/{cv.id}" variant="ghost" size="sm">
			<Eye class="mr-2 h-4 w-4" /> View
		</Button>

		{#if !cv.sourceId}
			<Button variant="ghost" size="sm" onclick={() => (tailorModalOpen = true)}>
				<Scissors class="mr-2 h-4 w-4" /> Tailor
			</Button>
		{/if}

		{#if cv.sourceId && masterCv}
			<Button
				variant="ghost"
				size="sm"
				class={updatesAvailable ? 'text-primary' : ''}
				onclick={() => onSync(cv)}
			>
				<RefreshCw class="mr-2 h-4 w-4" />
				Sync
				{#if updatesAvailable}
					<span class="bg-primary ml-1 h-2 w-2 rounded-full"></span>
				{/if}
			</Button>
		{/if}

		<AlertDialog>
			<AlertDialogTrigger>
				{#snippet child({ props })}
					<Button variant="ghost" size="sm" {...props}>
						<Trash2 class="mr-2 h-4 w-4" />
						Delete
					</Button>
				{/snippet}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete CV?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete "{cv.name}". This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onclick={() => onDelete(cv.id)}>Delete</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</CardFooter>
</Card>

<TailorModal sourceCv={cv} bind:open={tailorModalOpen} onCreate={onTailor} />
