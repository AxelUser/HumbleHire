<script>
	import { version } from '$app/environment';
	const displayVersion = `ver:${version}`;
</script>

<footer class="border-foreground bg-card border-t-2 px-6 py-3">
	<div class="mx-auto flex max-w-5xl flex-col items-center gap-1.5">
		<p class="text-muted-foreground text-sm font-bold tracking-wide">
			Built by
			<a
				href="https://maltsev.space"
				target="_blank"
				rel="noopener noreferrer"
				class="footer-link text-foreground"
			>
				Aleksey Maltsev
			</a>
			<span class="text-accent mx-1.5">·</span>
			{new Date().getFullYear()}
			<span class="text-accent mx-1.5">·</span>
			<span class="font-mono font-normal">{displayVersion}</span>
		</p>
	</div>
</footer>

<style>
	.footer-link {
		position: relative;
		text-decoration: none;
		font-weight: 800;
	}
	.footer-link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -2px;
		width: 100%;
		height: 2px;
		background-color: var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 150ms ease;
	}
	.footer-link:hover::after {
		transform: scaleX(1);
	}
</style>
