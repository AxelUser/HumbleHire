<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { notifyUpdate } from '$lib/pwa/reload-toast';
	import { Toaster } from '$lib/components/ui/sonner';
	import Button from '$lib/components/ui/button/button.svelte';

	const { Story } = defineMeta({
		title: 'PWA/Reload Toast',
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Default" asChild>
	<div class="p-8">
		<Toaster />
		<Button onclick={() => notifyUpdate(() => {})}>Show reload toast</Button>
	</div>
</Story>
