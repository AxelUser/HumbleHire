<script lang="ts">
	import { EditableList } from '$lib/components/ui/editable-list';
	import { createObjectId, type ObjectId } from '$lib/types/cv';

	interface ListItem {
		objectId: ObjectId;
		value: string;
	}

	interface Props {
		startItems?: string[];
	}

	let { startItems = [] }: Props = $props();

	let items = $state<ListItem[]>(
		startItems.map((value) => ({ objectId: createObjectId(), value }))
	);
</script>

<div class="flex flex-col gap-4">
	<EditableList bind:items placeholder="Add an item..." addLabel="Add Item" />
	<pre class="text-muted-foreground text-xs">{JSON.stringify(items, null, 2)}</pre>
</div>
