<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IosInstallSheet from '$lib/components/pwa/ios-install-sheet.svelte';

	const { Story } = defineMeta({
		title: 'PWA/iOS Install Sheet',
		component: IosInstallSheet,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Open" asChild>
	<IosInstallSheet open />
</Story>
