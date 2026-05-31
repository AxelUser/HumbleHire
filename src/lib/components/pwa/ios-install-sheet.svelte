<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import Share2 from '@lucide/svelte/icons/share-2';

	let { open = $bindable(false) } = $props();
</script>

<Drawer.Root bind:open>
	<Drawer.Portal>
		<Drawer.Overlay />
		<Drawer.Content>
			<Drawer.Header class="px-6 pt-2 pb-4 text-left">
				<Drawer.Title class="text-lg font-extrabold">Add to Home Screen</Drawer.Title>
				<Drawer.Description class="text-muted-foreground mt-1 text-sm">
					Install HumbleHire for the best experience and to keep your CVs safe.
				</Drawer.Description>
			</Drawer.Header>

			<div class="px-6 pb-4">
				<ol class="space-y-4">
					<li class="flex items-start gap-3">
						<span
							class="border-foreground bg-accent text-accent-foreground flex h-6 w-6 shrink-0 items-center justify-center border-2 text-xs font-extrabold"
							>1</span
						>
						<span class="text-sm">
							Tap the <strong>Share</strong> button
							<Share2 class="inline h-4 w-4 align-middle" />
							at the bottom of Safari.
						</span>
					</li>
					<li class="flex items-start gap-3">
						<span
							class="border-foreground bg-accent text-accent-foreground flex h-6 w-6 shrink-0 items-center justify-center border-2 text-xs font-extrabold"
							>2</span
						>
						<span class="text-sm">
							Tap <strong>'Add to Home Screen'</strong> from the menu.
						</span>
					</li>
				</ol>

				<p class="text-muted-foreground mt-5 text-xs">
					This also protects your CVs from being cleared by the browser.
				</p>
			</div>

			<Drawer.Footer class="px-6 pb-6">
				<Drawer.Close
					class="border-foreground bg-background shadow-brutal-sm hover-brutal inline-flex w-full items-center justify-center border-2 px-3 py-2 text-sm font-bold"
				>
					Got it
				</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
