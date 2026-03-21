<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EditableList from '$lib/components/ui/editable-list/editable-list.svelte';
	import EditableListWrapper from './helpers/EditableListWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/EditableList',
		component: EditableList,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<EditableList
		items={['Strong communication skills', 'Led cross-functional teams', 'Shipped 3 major features']}
		placeholder="Add an item..."
		addLabel="Add Item"
	/>
</Story>

<Story name="Empty" asChild>
	<EditableList items={[]} placeholder="Add an item..." addLabel="Add Item" />
</Story>

<Story name="Interactive" asChild>
	<EditableListWrapper startItems={['Built CI/CD pipeline', 'Reduced bundle size by 40%']} />
</Story>
