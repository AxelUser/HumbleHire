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
	import { downloadPdf } from '$lib/features/export/generate';
	import { downloadHumbleHireJson, downloadJsonResume } from '$lib/features/export/serialize';
	import { toast } from 'svelte-sonner';
	import { capture } from '$lib/analytics';
	import type { CV } from '$lib/types/cv';

	interface Props {
		cv: CV;
		size?: 'sm' | 'default';
		class?: string;
	}

	let { cv, size = 'sm', class: className = '' }: Props = $props();

	let exporting = $state(false);

	async function handlePdf() {
		if (exporting) return;
		exporting = true;
		try {
			await downloadPdf(cv);
			capture('cv_exported', { format: 'pdf', is_tailored: !!cv.sourceId });
		} catch {
			toast.error('Export failed. Please try again.');
		} finally {
			exporting = false;
		}
	}

	function handleHumbleHireJson() {
		try {
			downloadHumbleHireJson(cv);
			capture('cv_exported', { format: 'humblehire_json', is_tailored: !!cv.sourceId });
		} catch {
			toast.error('Export failed. Please try again.');
		}
	}

	function handleJsonResume() {
		try {
			downloadJsonResume(cv);
			capture('cv_exported', { format: 'json_resume', is_tailored: !!cv.sourceId });
		} catch {
			toast.error('Export failed. Please try again.');
		}
	}
</script>

<ButtonGroup class={className}>
	<Button variant="outline" {size} onclick={handlePdf} disabled={exporting}>
		<Download class="h-3.5 w-3.5" />
		{exporting ? 'Exporting…' : 'Export PDF'}
	</Button>

	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<Button variant="outline" {size} {...props} aria-label="More export options">
					<EllipsisVertical class="h-3.5 w-3.5" />
				</Button>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem onclick={handlePdf} disabled={exporting}>
				<Download class="h-3.5 w-3.5" />
				Export PDF
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem onclick={handleHumbleHireJson}>HumbleHire JSON</DropdownMenuItem>
			<DropdownMenuItem onclick={handleJsonResume}>JSON Resume</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</ButtonGroup>
