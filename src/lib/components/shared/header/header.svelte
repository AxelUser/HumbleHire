<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
</script>

<header class="w-full border-b bg-background">
    <div class="container mx-auto px-4 h-14 flex items-center">
        <NavigationMenu.Root>
            <NavigationMenu.List>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    </div>
</header>
