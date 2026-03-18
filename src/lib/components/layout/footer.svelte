<script lang="ts">
	import { mode } from 'mode-watcher';
</script>

<footer class="border-t-2 border-foreground bg-card px-6 py-4">
	<div class="mx-auto flex max-w-5xl items-center justify-between text-xs font-medium text-muted-foreground">
		<div class="flex items-center gap-1.5 font-bold tracking-tight">
			<img src={mode.current === 'dark' ? '/logo/humblehire_logo_dark.avif' : '/logo/humblehire_logo_light.avif'} alt="HumbleHire" class="h-10 w-auto" />
			<span>HumbleHire</span>
		</div>
		<span>
			Built by <strong class="text-foreground">Aleksey Maltsev</strong> · {new Date().getFullYear()}
		</span>
	</div>
</footer>
