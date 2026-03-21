<script lang="ts">
	import { untrack } from 'svelte';
	import { EditableList } from '$lib/components/ui/editable-list';

	interface Props {
		startItems?: string[];
	}

	let { startItems = [] }: Props = $props();

	let items: string[] = $state(untrack(() => [...startItems]));
</script>

<div class="flex flex-col gap-4">
	<EditableList bind:items placeholder="Add an item..." addLabel="Add Item" />
	<pre class="text-xs text-muted-foreground">{JSON.stringify(items, null, 2)}</pre>
</div>
