<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Card',
		component: Card,
		tags: ['autodocs']
	});
</script>

<Story name="Basic">
		<Card class="w-64">
			<CardContent>
				<p class="text-sm">Basic card content.</p>
			</CardContent>
		</Card>
</Story>

<Story name="WithHeader">
		<Card class="w-64">
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>A short description of the card.</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-sm">Card content goes here.</p>
			</CardContent>
		</Card>
</Story>

<Story name="FullCard">
		<Card class="w-64">
			<CardHeader>
				<CardTitle>Full Card</CardTitle>
				<CardDescription>With header, content, and footer.</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-sm">This card has all sections filled in.</p>
			</CardContent>
			<CardFooter class="flex gap-2">
				<Button variant="outline" size="sm">Cancel</Button>
				<Button size="sm">Confirm</Button>
			</CardFooter>
		</Card>
</Story>
