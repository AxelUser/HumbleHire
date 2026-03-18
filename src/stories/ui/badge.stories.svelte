<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Mail } from '@lucide/svelte';

	const { Story } = defineMeta({
		title: 'UI/Badge',
		component: Badge,
		tags: ['autodocs']
	});
</script>

<Story name="AllVariants">
		<div class="flex flex-wrap gap-3">
			<Badge variant="default">Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="destructive">Destructive</Badge>
			<Badge variant="outline">Outline</Badge>
		</div>
</Story>

<Story name="WithIcon">
		<Badge variant="default"><Mail />New Message</Badge>
</Story>

<Story name="AsLink">
		<Badge href="https://example.com" variant="outline">Clickable Badge</Badge>
</Story>
