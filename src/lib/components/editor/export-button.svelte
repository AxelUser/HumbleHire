<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download } from '@lucide/svelte';
	import { downloadPdf } from '$lib/features/export/generate';
	import { toast } from 'svelte-sonner';
	import type { CV } from '$lib/types/cv';

	interface Props {
		cv: CV;
		variant?: 'outline' | 'ghost' | 'default';
		size?: 'sm' | 'default';
		class?: string;
	}

	let { cv, variant = 'outline', size = 'sm', class: className = '' }: Props = $props();

	let exporting = $state(false);

	async function handleExport() {
		if (exporting) return;
		exporting = true;
		try {
			await downloadPdf(cv);
		} catch (err) {
			console.error('Export failed:', err);
			toast.error('Export failed. Please try again.');
		} finally {
			exporting = false;
		}
	}
</script>

<Button {variant} {size} class={className} onclick={handleExport} disabled={exporting}>
	<Download class="h-3.5 w-3.5" />
	{exporting ? 'Exporting…' : 'Export'}
</Button>
