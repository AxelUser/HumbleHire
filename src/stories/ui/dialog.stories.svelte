<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogTrigger from '$lib/components/ui/dialog/dialog-trigger.svelte';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogDescription from '$lib/components/ui/dialog/dialog-description.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Dialog',
		component: Dialog,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Basic" asChild>
	<div class="p-8">
		<Dialog>
			<DialogTrigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open Dialog</Button>
				{/snippet}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Dialog Title</DialogTitle>
					<DialogDescription>This is a dialog description.</DialogDescription>
				</DialogHeader>
				<p class="text-sm">Dialog body content goes here.</p>
				<DialogFooter>
					<Button variant="outline">Cancel</Button>
					<Button>Confirm</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
</Story>

<Story name="NoCloseButton" asChild>
	<div class="p-8">
		<Dialog>
			<DialogTrigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open Dialog</Button>
				{/snippet}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm Action</DialogTitle>
					<DialogDescription>Are you sure you want to proceed?</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline">No</Button>
					<Button>Yes, proceed</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
</Story>
