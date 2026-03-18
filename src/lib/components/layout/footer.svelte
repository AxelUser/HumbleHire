<footer class="border-t-2 border-foreground bg-card px-6 py-3">
	<div class="mx-auto flex max-w-5xl flex-col items-center gap-1.5">
		<p class="text-sm font-bold tracking-wide text-muted-foreground">
			Built by
			<a
				href="https://maltsev.space"
				target="_blank"
				rel="noopener noreferrer"
				class="footer-link text-foreground"
			>
				Aleksey Maltsev
			</a>
			<span class="mx-1.5 text-accent">·</span>
			{new Date().getFullYear()}
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
