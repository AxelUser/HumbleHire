<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Upload, FileJson } from '@lucide/svelte';
	import { fromDocument, UnsupportedSchemaVersionError } from '$lib/features/export/serialize';
	import type { CvDocument } from '$lib/features/export/document';
	import { db } from '$lib/db/index';
	import { capture } from '$lib/analytics';
	import { computeBlockHashes } from '$lib/features/tailoring/hash';

	interface Props {
		open?: boolean;
		onImport?: (id: string) => void;
	}

	let { open = $bindable(false), onImport }: Props = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let parseError = $state<string | null>(null);
	let importing = $state(false);
	let pendingDoc = $state<CvDocument | null>(null);
	let pendingFileName = $state<string>('');

	function reset() {
		parseError = null;
		pendingDoc = null;
		pendingFileName = '';
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

		parseError = null;
		pendingDoc = null;
		pendingFileName = file.name;

		const reader = new FileReader();
		reader.onload = () => {
			try {
				const raw = JSON.parse(reader.result as string);
				// Validate it has at least one expected JSON Resume field before accepting
				if (typeof raw !== 'object' || raw === null) throw new Error('Not a valid JSON object.');
				pendingDoc = raw as CvDocument;
			} catch {
				parseError =
					'Could not parse the file. Make sure it is a valid JSON Resume or HumbleHire JSON file.';
			}
		};
		reader.onerror = () => {
			parseError = 'Could not read the file.';
		};
		reader.readAsText(file);
	}

	async function handleImport() {
		if (!pendingDoc) return;
		importing = true;
		parseError = null;

		try {
			const cv = fromDocument(pendingDoc);
			cv.blockHashes = computeBlockHashes(cv.blocks);
			await db.cvs.add(cv);
			capture('cv_imported', {
				has_humblehire_meta: !!pendingDoc.meta?.humblehire
			});
			open = false;
			onImport?.(cv.id);
		} catch (err) {
			if (err instanceof UnsupportedSchemaVersionError) {
				parseError = err.message;
			} else {
				parseError = 'Import failed. The file may be corrupt or in an unsupported format.';
			}
		} finally {
			importing = false;
		}
	}
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle class="font-bold">Import CV</DialogTitle>
			<DialogDescription>
				Import a CV from a HumbleHire JSON or JSON Resume file. A new CV will be created.
			</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-4 py-2">
			{#if !pendingDoc}
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
					<FileJson class="text-accent h-5 w-5 shrink-0" />
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium">{pendingFileName}</p>
						<p class="text-muted-foreground text-xs">
							{pendingDoc.basics?.name ?? 'Unnamed CV'}
						</p>
					</div>
					<Button variant="ghost" size="sm" onclick={reset}>Change</Button>
				</div>
			{/if}

			{#if parseError}
				<p class="text-destructive text-sm">{parseError}</p>
			{/if}
		</div>

		<DialogFooter>
			<DialogClose>
				<Button variant="outline">Cancel</Button>
			</DialogClose>
			<Button onclick={handleImport} disabled={!pendingDoc || importing}>
				{importing ? 'Importing…' : 'Import'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
