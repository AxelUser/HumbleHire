<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AlertDialog from '$lib/components/ui/alert-dialog/alert-dialog.svelte';
	import AlertDialogTrigger from '$lib/components/ui/alert-dialog/alert-dialog-trigger.svelte';
	import AlertDialogContent from '$lib/components/ui/alert-dialog/alert-dialog-content.svelte';
	import AlertDialogHeader from '$lib/components/ui/alert-dialog/alert-dialog-header.svelte';
	import AlertDialogTitle from '$lib/components/ui/alert-dialog/alert-dialog-title.svelte';
	import AlertDialogDescription from '$lib/components/ui/alert-dialog/alert-dialog-description.svelte';
	import AlertDialogFooter from '$lib/components/ui/alert-dialog/alert-dialog-footer.svelte';
	import AlertDialogCancel from '$lib/components/ui/alert-dialog/alert-dialog-cancel.svelte';
	import AlertDialogAction from '$lib/components/ui/alert-dialog/alert-dialog-action.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/AlertDialog',
		component: AlertDialog,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="DestructiveConfirmation" asChild>
		<div class="p-8">
			<AlertDialog>
				<AlertDialogTrigger>
					{#snippet child({ props })}
						<Button variant="destructive" {...props}>Delete Item</Button>
					{/snippet}
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your item.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction>Yes, delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
</Story>
