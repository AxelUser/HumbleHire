<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
</script>

<header class="bg-background w-full border-b">
	<div class="container mx-auto flex h-14 items-center px-4">
		<NavigationMenu.Root>
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Link href="/">Home</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>
</header>
