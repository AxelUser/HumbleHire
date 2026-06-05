<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { ImportButton } from '$lib/components/import';
	import { addBlankCv, type CvCreationSource } from '$lib/services/cv/add-blank-cv';

	interface Props {
		onCreate: (id: string) => void;
		source: CvCreationSource;
		newCvLabel?: string;
		class?: string;
	}

	let { onCreate, source, newCvLabel = 'New CV', class: className = '' }: Props = $props();

	async function handleNew() {
		const id = await addBlankCv(source);
		onCreate(id);
	}
</script>

<div class={cn('flex flex-wrap items-center gap-2', className)}>
	<ImportButton onImport={onCreate} />
	<Button variant="accent" size="lg" onclick={handleNew}>
		<Plus class="size-4" />
		{newCvLabel}
	</Button>
</div>
