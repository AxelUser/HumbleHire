<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SaveVersionModal from '$lib/components/editor/save-version-modal.svelte';
	import SaveVersionModalWrapper from './helpers/SaveVersionModalWrapper.svelte';

	const { Story } = defineMeta({
		title: 'Editor/SaveVersionModal',
		component: SaveVersionModal,
		tags: ['!autodocs'],
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Open" asChild>
		<SaveVersionModalWrapper />
</Story>
