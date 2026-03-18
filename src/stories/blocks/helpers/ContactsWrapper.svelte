<script lang="ts">
	import ContactsBlock from '$lib/components/blocks/contacts-block.svelte';
	import type { ContactEntry } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	let contacts = $state<ContactEntry[]>(
		startEmpty
			? []
			: [
					{ id: '1', label: 'Email', value: 'aleksey@maltsev.space' },
					{ id: '2', label: 'GitHub', value: 'github.com/axeluser' },
					{ id: '3', label: 'LinkedIn', value: 'linkedin.com/in/aleksey-maltsev' }
				]
	);
	let visible = $state(startVisible);
</script>

<ContactsBlock bind:contacts bind:visible />
