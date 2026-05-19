<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Scissors } from '@lucide/svelte';
	import { createTailoredCV } from '$lib/features/tailoring/create-tailored';
	import type { CV } from '$lib/types/cv';

	interface Props {
		sourceCv: CV;
		onCreate: (id: string) => void;
		open?: boolean;
	}

	let { sourceCv, onCreate, open = $bindable(false) }: Props = $props();

	let company = $state('');
	let name = $state('');
	let notes = $state('');
	let loading = $state(false);

	function reset() {
		company = '';
		name = '';
		notes = '';
		loading = false;
	}

	async function handleCreate() {
		if (!name.trim()) return;
		loading = true;
		try {
			const id = await createTailoredCV(
				$state.snapshot(sourceCv),
				name.trim(),
				notes.trim(),
				company.trim() || undefined
			);
			open = false;
			reset();
			onCreate(id);
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		open = false;
		reset();
	}
</script>

{#if !sourceCv.sourceId}
	<Button variant="accent" size="sm" onclick={() => (open = true)}>
		<Scissors class="h-3.5 w-3.5" /> Tailor a copy
	</Button>

	<Dialog bind:open>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Create Tailored CV</DialogTitle>
				<DialogDescription>Tailoring from: {sourceCv.name}</DialogDescription>
			</DialogHeader>

			<div class="flex flex-col gap-4 py-2">
				<div class="flex flex-col gap-1.5">
					<Label for="tailored-company">
						Company <span class="text-muted-foreground">(optional)</span>
					</Label>
					<Input
						id="tailored-company"
						bind:value={company}
						placeholder="e.g. Stripe"
						disabled={loading}
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="tailored-name">Name</Label>
					<Input
						id="tailored-name"
						bind:value={name}
						placeholder="e.g. Senior Frontend Engineer"
						disabled={loading}
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="tailored-notes">
						Notes <span class="text-muted-foreground">(optional)</span>
					</Label>
					<Textarea
						id="tailored-notes"
						bind:value={notes}
						placeholder="e.g. Tailored for their ML team"
						rows={3}
						disabled={loading}
					/>
				</div>
			</div>

			<DialogFooter>
				<Button variant="outline" onclick={handleCancel} disabled={loading}>Cancel</Button>
				<Button onclick={handleCreate} disabled={!name.trim() || loading}>Create</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
{/if}
