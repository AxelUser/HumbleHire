<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Separator from '$lib/components/ui/separator/separator.svelte';

	const { Story } = defineMeta({
		title: 'UI/Separator',
		component: Separator,
		tags: ['autodocs']
	});
</script>

<Story name="Horizontal" asChild>
	<div class="w-64">
		<p class="text-sm">Above</p>
		<Separator class="my-2" />
		<p class="text-sm">Below</p>
	</div>
</Story>

<Story name="Vertical" asChild>
	<div class="flex h-8 items-center gap-3">
		<span class="text-sm">Left</span>
		<Separator orientation="vertical" />
		<span class="text-sm">Right</span>
	</div>
</Story>
