<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	const { Story } = defineMeta({
		title: 'UI/Skeleton',
		component: Skeleton,
		tags: ['autodocs']
	});
</script>

<Story name="VariousSizes" asChild>
	<div class="flex w-64 flex-col gap-3">
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-3/4" />
		<Skeleton class="h-4 w-1/2" />
		<Skeleton class="h-8 w-full" />
		<Skeleton class="h-12 w-12 rounded-full" />
	</div>
</Story>

<Story name="CardSkeleton" asChild>
	<div class="border-foreground flex w-64 flex-col gap-3 border-2 p-4">
		<Skeleton class="h-5 w-1/2" />
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-3/4" />
		<div class="mt-2 flex gap-2">
			<Skeleton class="h-8 w-20" />
			<Skeleton class="h-8 w-20" />
		</div>
	</div>
</Story>
