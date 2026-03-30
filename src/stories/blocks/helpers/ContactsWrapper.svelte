<script lang="ts">
	import ContactsBlock from '$lib/components/blocks/contacts-block.svelte';
	import { createObjectId } from '$lib/types/cv';
	import type { ObjectId, ContactEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	const blockId = createObjectId();

	let contacts = $state<ContactEntry[]>(
		startEmpty
			? []
			: [
					{ objectId: createObjectId(), label: 'Email', value: 'aleksey@maltsev.space' },
					{ objectId: createObjectId(), label: 'GitHub', value: 'github.com/axeluser' },
					{ objectId: createObjectId(), label: 'LinkedIn', value: 'linkedin.com/in/aleksey-maltsev' }
				]
	);
	let hiddenBlockIds = $state<ObjectId[]>(startVisible ? [] : [blockId]);
</script>

<ContactsBlock bind:contacts {blockId} bind:hiddenBlockIds />
