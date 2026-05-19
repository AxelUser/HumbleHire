<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { db } from '$lib/db/index';
	import { createCVFromTemplate } from '$lib/services/cv/create';

	interface Props {
		onCreate: (id: string) => void;
	}

	let { onCreate }: Props = $props();

	async function handleClick() {
		const id = crypto.randomUUID();
		const cv = createCVFromTemplate(id, 'Untitled CV');
		await db.cvs.add(cv);
		onCreate(id);
	}
</script>

<Button variant="accent" size="lg" onclick={handleClick}>
	<Plus class="mr-2 h-4 w-4" />
	New CV
</Button>
