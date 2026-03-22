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
	import { Eye, Trash2 } from '@lucide/svelte';

	interface Props {
		cv: CV;
		onDelete: (id: string) => void;
	}

	let { cv, onDelete }: Props = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>{cv.name}</CardTitle>
	</CardHeader>
	<CardDescription class="px-6 pb-2">
		Last edited: {new Date(cv.updatedAt).toLocaleDateString()}
	</CardDescription>
	<CardFooter class="flex gap-2">
		<Button href="/cv/{cv.id}" variant="ghost" size="sm">
			<Eye class="mr-2 h-4 w-4" /> View
		</Button>
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
