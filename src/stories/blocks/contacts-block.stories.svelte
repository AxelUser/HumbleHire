<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ContactsBlock from '$lib/components/blocks/contacts-block.svelte';
	import ContactsWrapper from './helpers/ContactsWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Blocks/Contacts',
		component: ContactsBlock,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<ContactsWrapper startVisible={true} />
</Story>

<Story name="Hidden" asChild>
	<ContactsWrapper startVisible={false} />
</Story>

<Story name="Empty" asChild>
	<ContactsWrapper startEmpty={true} />
</Story>
