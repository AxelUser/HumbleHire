<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from '$lib/components/ui/button/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'destructive', 'outline', 'secondary', 'accent', 'ghost', 'link']
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg']
			},
			disabled: { control: 'boolean' }
		},
		args: { variant: 'default', size: 'default', disabled: false }
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<Button {...args}>Click me</Button>
	{/snippet}
</Story>

<Story name="AllVariants" asChild>
	<div class="flex flex-wrap gap-3">
		<Button variant="default">Default</Button>
		<Button variant="destructive">Destructive</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="accent">Accent</Button>
		<Button variant="ghost">Ghost</Button>
		<Button variant="link">Link</Button>
	</div>
</Story>

<Story name="AllSizes" asChild>
	<div class="flex flex-wrap items-center gap-3">
		<Button size="sm">Small</Button>
		<Button size="default">Default</Button>
		<Button size="lg">Large</Button>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div class="flex flex-wrap gap-3">
		<Button disabled>Disabled Default</Button>
		<Button variant="outline" disabled>Disabled Outline</Button>
	</div>
</Story>

<Story name="AsLink" asChild>
	<Button href="https://example.com" variant="outline">Open Link</Button>
</Story>
