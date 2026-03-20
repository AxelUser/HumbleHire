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
		<div class="flex flex-col gap-3 w-64">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-3/4" />
			<Skeleton class="h-4 w-1/2" />
			<Skeleton class="h-8 w-full" />
			<Skeleton class="h-12 w-12 rounded-full" />
		</div>
</Story>

<Story name="CardSkeleton" asChild>
		<div class="w-64 border-2 border-foreground p-4 flex flex-col gap-3">
			<Skeleton class="h-5 w-1/2" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-3/4" />
			<div class="flex gap-2 mt-2">
				<Skeleton class="h-8 w-20" />
				<Skeleton class="h-8 w-20" />
			</div>
		</div>
</Story>
