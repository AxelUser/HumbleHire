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
		<div class="p-8 bg-background min-h-screen max-w-4xl mx-auto">
			<h1 class="text-2xl font-extrabold mb-8">UI Components Showcase</h1>

			<section class="mb-8">
				<h2 class="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">Buttons</h2>
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
				<h2 class="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">Badges</h2>
				<div class="flex flex-wrap gap-3">
					<Badge variant="default">Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</div>
			</section>

			<Separator class="mb-8" />

			<section class="mb-8">
				<h2 class="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">Inputs</h2>
				<div class="flex flex-col gap-3 max-w-sm">
					<Input placeholder="Default input" />
					<Input value="With value" />
					<Input disabled placeholder="Disabled" />
				</div>
			</section>

			<Separator class="mb-8" />

			<section class="mb-8">
				<h2 class="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">Cards</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
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
				<h2 class="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">Skeleton</h2>
				<div class="flex flex-col gap-2 max-w-sm">
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-4 w-1/2" />
				</div>
			</section>

			<Separator class="mb-8" />

			<section class="mb-8">
				<h2 class="text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground">Switch</h2>
				<div class="flex items-center gap-4">
					<Switch checked={false} />
					<Switch checked={true} />
				</div>
			</section>
		</div>
</Story>
