<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CvEditorToolbar from '$lib/components/editor/cv-editor-toolbar.svelte';
	import CvEditorToolbarWrapper from './helpers/CvEditorToolbarWrapper.svelte';
	import CvEditorToolbarSavingWrapper from './helpers/CvEditorToolbarSavingWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Editor/CvEditorToolbar',
		component: CvEditorToolbar,
		tags: ['autodocs']
	});
</script>

<Story name="SavedState" asChild>
		<CvEditorToolbarWrapper />
</Story>

<Story name="SavingState" asChild>
		<CvEditorToolbarSavingWrapper />
</Story>
