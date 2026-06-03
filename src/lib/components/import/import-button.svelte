<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Upload } from '@lucide/svelte';
	import ImportDialog from './import-dialog.svelte';

	interface Props {
		onImport?: (id: string) => void;
		variant?: 'outline' | 'ghost' | 'default' | 'accent';
		size?: 'sm' | 'default' | 'lg';
		class?: string;
	}

	let { onImport, variant = 'outline', size = 'lg', class: className = '' }: Props = $props();

	let dialogOpen = $state(false);
</script>

<Button {variant} {size} class={className} onclick={() => (dialogOpen = true)}>
	<Upload class="size-4" />
	Import
</Button>

<ImportDialog bind:open={dialogOpen} {onImport} />
