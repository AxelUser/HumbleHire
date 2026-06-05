<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ButtonGroup } from '$lib/components/ui/button-group';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator
	} from '$lib/components/ui/dropdown-menu';
	import { Download, EllipsisVertical } from '@lucide/svelte';
	import { downloadPdf, sanitizeFilename } from '$lib/features/export/generate';
	import { toDocument, toJsonResume } from '$lib/features/serialization/serialize';
	import { toast } from 'svelte-sonner';
	import { capture } from '$lib/analytics';
	import type { CV } from '$lib/types/cv';

	interface Props {
		cv: CV;
		size?: 'sm' | 'default';
		variant?: 'outline' | 'ghost';
		class?: string;
	}

	let { cv, size = 'sm', variant = 'outline', class: className = '' }: Props = $props();

	let exporting = $state(false);

	function triggerDownload(blob: Blob, filename: string): void {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 100);
	}

	async function exportAs(format: 'pdf' | 'humblehire_json' | 'json_resume'): Promise<void> {
		if (exporting) return;
		exporting = true;
		try {
			if (format === 'pdf') {
				await downloadPdf(cv);
			} else if (format === 'humblehire_json') {
				const doc = toDocument(cv);
				const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
				triggerDownload(blob, `${sanitizeFilename(cv.name)}.humblehire.json`);
			} else {
				const doc = toJsonResume(cv);
				const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
				triggerDownload(blob, `${sanitizeFilename(cv.name)}.json`);
			}
			capture('cv_exported', { format, is_tailored: !!cv.sourceId });
		} catch {
			toast.error('Export failed. Please try again.');
		} finally {
			exporting = false;
		}
	}
</script>

<ButtonGroup class={className}>
	<Button {variant} {size} onclick={() => exportAs('pdf')} disabled={exporting}>
		<Download class="h-3.5 w-3.5" />
		{exporting ? 'Exporting…' : 'Export PDF'}
	</Button>

	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<Button {variant} {size} {...props} aria-label="More export options">
					<EllipsisVertical class="h-3.5 w-3.5" />
				</Button>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem onclick={() => exportAs('pdf')} disabled={exporting}>
				<Download class="h-3.5 w-3.5" />
				Export PDF
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem onclick={() => exportAs('humblehire_json')}>
				HumbleHire JSON
			</DropdownMenuItem>
			<DropdownMenuItem onclick={() => exportAs('json_resume')}>JSON Resume</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</ButtonGroup>
