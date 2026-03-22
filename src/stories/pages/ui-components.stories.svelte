<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';

	const { Story } = defineMeta({
		title: 'Pages/UIComponents',
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Showcase">
	<div class="bg-background mx-auto min-h-screen max-w-4xl p-8">
		<h1 class="mb-8 text-2xl font-extrabold">UI Components Showcase</h1>

		<section class="mb-8">
			<h2 class="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">
				Buttons
			</h2>
			<div class="flex flex-wrap gap-3">
				<Button variant="default">Default</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="accent">Accent</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
				<Button disabled>Disabled</Button>
			</div>
		</section>

		<Separator class="mb-8" />

		<section class="mb-8">
			<h2 class="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">Badges</h2>
			<div class="flex flex-wrap gap-3">
				<Badge variant="default">Default</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="destructive">Destructive</Badge>
				<Badge variant="outline">Outline</Badge>
			</div>
		</section>

		<Separator class="mb-8" />

		<section class="mb-8">
			<h2 class="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">Inputs</h2>
			<div class="flex max-w-sm flex-col gap-3">
				<Input placeholder="Default input" />
				<Input value="With value" />
				<Input disabled placeholder="Disabled" />
			</div>
		</section>

		<Separator class="mb-8" />

		<section class="mb-8">
			<h2 class="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">Cards</h2>
			<div class="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader><CardTitle>Card Title</CardTitle></CardHeader>
					<CardContent><p class="text-sm">Card body content.</p></CardContent>
				</Card>
				<Card>
					<CardHeader><CardTitle>Another Card</CardTitle></CardHeader>
					<CardContent><p class="text-sm">More content here.</p></CardContent>
				</Card>
			</div>
		</section>

		<Separator class="mb-8" />

		<section class="mb-8">
			<h2 class="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">
				Skeleton
			</h2>
			<div class="flex max-w-sm flex-col gap-2">
				<Skeleton class="h-4 w-full" />
				<Skeleton class="h-4 w-3/4" />
				<Skeleton class="h-4 w-1/2" />
			</div>
		</section>

		<Separator class="mb-8" />

		<section class="mb-8">
			<h2 class="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">Switch</h2>
			<div class="flex items-center gap-4">
				<Switch checked={false} />
				<Switch checked={true} />
			</div>
		</section>
	</div>
</Story>
