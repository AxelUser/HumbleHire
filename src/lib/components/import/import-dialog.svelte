<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Upload, FileBraces } from '@lucide/svelte';
	import { importDocument } from '$lib/features/serialization/import';
	import { capture } from '$lib/analytics';

	interface Props {
		open?: boolean;
		onImport?: (id: string) => void;
	}

	let { open = $bindable(false), onImport }: Props = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let errorMessage = $state<string | null>(null);
	let importing = $state(false);
	let pendingText = $state<string | null>(null);
	let pendingFileName = $state<string>('');
	let pendingName = $state<string>('');

	function reset() {
		errorMessage = null;
		pendingText = null;
		pendingFileName = '';
		pendingName = '';
		importing = false;
		if (fileInput) fileInput.value = '';
	}

	function handleOpenChange(value: boolean) {
		open = value;
		if (!value) reset();
	}

	function handleFileChange(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;

		errorMessage = null;
		pendingText = null;
		pendingFileName = file.name;
		pendingName = '';

		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			// Peek at the name for display — a full parse happens on import
			try {
				const raw = JSON.parse(text);
				pendingName = typeof raw?.basics?.name === 'string' ? raw.basics.name : '';
			} catch {
				// ignore; parse errors surface on import
			}
			pendingText = text;
		};
		reader.onerror = () => {
			errorMessage = 'Could not read the file.';
		};
		reader.readAsText(file);
	}

	async function handleImport() {
		if (!pendingText) return;
		importing = true;
		errorMessage = null;

		const result = await importDocument(pendingText);

		if (!result.ok) {
			importing = false;
			switch (result.error.kind) {
				case 'not-json':
					errorMessage =
						'Could not parse the file. Make sure it is a valid JSON Resume or HumbleHire JSON file.';
					break;
				case 'schema':
					errorMessage =
						'Could not parse the file. Make sure it is a valid JSON Resume or HumbleHire JSON file.';
					break;
				case 'unsupported-version':
					errorMessage = `This file was exported by a newer version of HumbleHire (schema v${result.error.version}). Update the app to import it.`;
					break;
			}
			return;
		}

		if (result.dropped.length > 0) {
			// Non-fatal: surface as informational after import succeeds
			console.info(`Sections not imported (no matching block): ${result.dropped.join(', ')}`);
		}

		capture('cv_imported', { has_humblehire_meta: pendingText.includes('"humblehire"') });
		open = false;
		onImport?.(result.cv.id);
		importing = false;
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="font-bold">Import CV</Dialog.Title>
			<Dialog.Description>
				Import a CV from a HumbleHire JSON or JSON Resume file. A new CV will be created.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex min-w-0 flex-col gap-4 overflow-hidden py-2">
			{#if !pendingText}
				<label
					class="border-foreground hover:bg-muted flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed px-6 py-8 text-center transition-colors"
				>
					<Upload class="text-muted-foreground h-8 w-8" />
					<span class="text-sm font-medium">Click to choose a file</span>
					<span class="text-muted-foreground text-xs">.humblehire.json or .json (JSON Resume)</span>
					<input
						bind:this={fileInput}
						type="file"
						accept=".json"
						class="sr-only"
						onchange={handleFileChange}
					/>
				</label>
			{:else}
				<div class="border-foreground flex items-center gap-3 border-2 px-4 py-3">
					<FileBraces class="text-accent h-5 w-5 shrink-0" />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium" title={pendingFileName}>{pendingFileName}</p>
						<p class="text-muted-foreground text-xs">{pendingName || 'Unnamed CV'}</p>
					</div>
					<Button variant="ghost" size="sm" onclick={reset}>Change</Button>
				</div>
			{/if}

			{#if errorMessage}
				<p class="text-destructive text-sm">{errorMessage}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Dialog.Close>
				<Button variant="outline">Cancel</Button>
			</Dialog.Close>
			<Button onclick={handleImport} disabled={!pendingText || importing}>
				{importing ? 'Importing…' : 'Import'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
