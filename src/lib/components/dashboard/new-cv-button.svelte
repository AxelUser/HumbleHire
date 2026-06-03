<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { db } from '$lib/db/index';
	import { createCV } from '$lib/services/cv/create';
	import { capture } from '$lib/analytics';
	import { createId } from '$lib/id.js';

	interface Props {
		onCreate: (id: string) => void;
	}

	let { onCreate }: Props = $props();

	async function handleClick() {
		const id = createId();
		const cv = createCV({ id, name: 'Untitled CV' });
		await db.cvs.add(cv);
		capture('cv_created', { source: 'dashboard' });
		onCreate(id);
	}
</script>

<Button variant="accent" size="lg" onclick={handleClick}>
	<Plus class="size-4" />
	New CV
</Button>
