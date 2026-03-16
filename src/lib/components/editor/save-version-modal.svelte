<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { saveVersion } from '$lib/stores/cv.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	let name = $state('');
	let notes = $state('');

	function reset() {
		name = '';
		notes = '';
	}

	async function handleSave() {
		if (!name.trim()) return;
		await saveVersion(name.trim(), notes.trim() || undefined);
		reset();
		open = false;
	}

	function handleCancel() {
		reset();
		open = false;
	}
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Save Version</DialogTitle>
		</DialogHeader>

		<div class="flex flex-col gap-4 py-2">
			<div class="flex flex-col gap-1.5">
				<Label for="version-name">Version name</Label>
				<Input
					id="version-name"
					bind:value={name}
					placeholder="e.g. Applied to Stripe"
					required
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label for="version-notes">Notes</Label>
				<Textarea
					id="version-notes"
					bind:value={notes}
					placeholder="Optional notes…"
					rows={3}
				/>
			</div>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={handleCancel}>Cancel</Button>
			<Button variant="default" disabled={!name.trim()} onclick={handleSave}>
				Save Version
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
