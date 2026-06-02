<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InstallButton from '$lib/components/pwa/install-button.svelte';

	const { Story } = defineMeta({
		title: 'PWA/Install Button',
		component: InstallButton,
		tags: ['autodocs']
	});
</script>

<Story name="Visible" asChild>
	<div class="p-8">
		<InstallButton canInstall onclick={() => {}} />
	</div>
</Story>
