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
	<EditableListWrapper
		startItems={[
			'Strong communication skills',
			'Led cross-functional teams',
			'Shipped 3 major features'
		]}
	/>
</Story>

<Story name="Empty" asChild>
	<EditableListWrapper startItems={[]} />
</Story>

<Story name="Interactive" asChild>
	<EditableListWrapper startItems={['Built CI/CD pipeline', 'Reduced bundle size by 40%']} />
</Story>
