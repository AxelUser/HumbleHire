<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { PROJECT_NAME } from '$lib/config.js';
</script>

<header class="bg-background w-full border-b">
	<div class="container mx-auto flex h-14 items-center px-4">
		<a href="/" class="mr-8 flex flex-row items-center gap-2">
			<img src="/humble-hire-logo-128.png" alt="Humble Hire" class="h-6 w-6" />
			<span class="text-xl font-bold">{PROJECT_NAME}</span>
		</a>
		<NavigationMenu.Root class="mt-1">
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Link href="/banner-generator">Banner Generator</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>
</header>
