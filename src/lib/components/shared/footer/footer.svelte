<script lang="ts">
	import { AUTHOR_HOMEPAGE, AUTHOR_NAME } from '$lib/config.js';
</script>

<footer class="bg-background w-full border-t">
	<div
		class="text-muted-foreground container mx-auto flex h-14 items-center justify-center px-4 text-sm"
	>
		<span>Made by <a href={AUTHOR_HOMEPAGE} class="underline">{AUTHOR_NAME}</a></span>
	</div>
</footer>
