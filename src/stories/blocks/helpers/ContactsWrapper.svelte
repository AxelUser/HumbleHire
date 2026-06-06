<script lang="ts">
	import ContactsBlock from '$lib/components/blocks/contacts-block.svelte';
	import { createObjectId, type Basics } from '$lib/types/cv';

	interface Props {
		startVisible?: boolean;
		startEmpty?: boolean;
	}

	let { startVisible = true, startEmpty = false }: Props = $props();

	let basics = $state<Basics>({
		fullName: '',
		position: '',
		location: '',
		summary: '',
		highlights: [],
		email: startEmpty ? '' : 'aleksey@maltsev.space',
		phone: '',
		url: '',
		profiles: startEmpty
			? []
			: [
					{ objectId: createObjectId(), network: 'GitHub', url: 'github.com/axeluser' },
					{
						objectId: createObjectId(),
						network: 'LinkedIn',
						url: 'linkedin.com/in/aleksey-maltsev'
					}
				]
	});
	let hidden = $state<string[]>(startVisible ? [] : ['basics/contacts/']);
</script>

<ContactsBlock bind:basics bind:hidden />
