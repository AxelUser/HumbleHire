<script lang="ts">
	import { onMount } from 'svelte';
	import * as Popover from '@ui/popover';
	import { ScrollArea } from '@ui/scroll-area';
	import Input from '@ui/input/input.svelte';
	import { Button } from '@ui/button';
	import { Check, ImagePlus } from '@lucide/svelte';

	type IconItem = {
		id: string;
		texts: string[];
		url: string;
	};

	interface Props {
		class?: string;
		items: IconItem[];
		selectedIds?: string[];
		onSelected?: (item: IconItem) => void;
		onUnselected?: (item: IconItem) => void;
		buttonLabel?: string;
		disabled?: boolean;
	}

	let {
		class: className,
		items,
		selectedIds = [],
		onSelected,
		onUnselected,
		buttonLabel = 'Pick from library',
		disabled = false
	}: Props = $props();

	let open = $state(false);
	let query = $state('');
	let visibleMap = $state<Record<string, boolean>>({});

	function matchesQuery(item: IconItem, q: string): boolean {
		if (!q) return true;
		const needle = q.toLowerCase();
		return item.texts.some((t) => t.toLowerCase().includes(needle));
	}

	function toggle(item: IconItem) {
		const isSelected = selectedIds.includes(item.url);
		if (isSelected) {
			onUnselected?.(item);
		} else if (!disabled) {
			onSelected?.(item);
		}
	}

	let observer: IntersectionObserver | null = null;
	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).dataset['id'];
					if (entry.isIntersecting && id) {
						visibleMap = { ...visibleMap, [id]: true };
						observer?.unobserve(entry.target);
					}
				}
			},
			{ rootMargin: '200px' }
		);
		return () => observer?.disconnect();
	});

	function observe(el: HTMLElement, id: string) {
		if (!observer) return;
		el.dataset['id'] = id;
		observer.observe(el);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button class={className} type="button" variant="secondary" {disabled}>
			<ImagePlus class="size-4" />
			{buttonLabel}
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-80 p-2">
		<div class="space-y-2">
			<Input placeholder="Search icons..." bind:value={query} />
			<ScrollArea class="h-80 w-full rounded border">
				<div class="p-2">
					<div class="grid grid-cols-4 gap-2">
						{#each items as item (item.id)}
							{#if matchesQuery(item, query)}
								<button
									class="hover:bg-accent relative flex aspect-square items-center justify-center rounded border"
									onclick={() => toggle(item)}
									aria-pressed={selectedIds.includes(item.url)}
									disabled={disabled && !selectedIds.includes(item.url)}
								>
									<div use:observe={item.id} class="flex size-full items-center justify-center p-2">
										{#if visibleMap[item.id]}
											<img
												src={item.url}
												alt={item.texts[0] || item.id}
												class="size-full object-contain"
												loading="lazy"
											/>
										{:else}
											<div class="bg-muted size-full animate-pulse rounded"></div>
										{/if}
									</div>
									{#if selectedIds.includes(item.url)}
										<span
											class="bg-primary text-primary-foreground ring-primary/40 absolute top-1 right-1 inline-flex size-5 items-center justify-center rounded-full shadow ring-1"
										>
											<Check class="size-3" />
										</span>
									{/if}
								</button>
							{/if}
						{/each}
					</div>
				</div>
			</ScrollArea>
		</div>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.popover-content) {
		max-width: 22rem;
	}
</style>
