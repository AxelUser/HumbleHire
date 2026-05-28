<div class="border-foreground bg-background shadow-brutal border-2 p-5 font-mono text-sm">
	<p class="text-muted-foreground mb-3 text-[11px] font-extrabold tracking-widest uppercase">
		↳ Your CV library
	</p>

	<!-- Master node -->
	<div class="node master mb-2 flex items-center gap-3 border-2 px-2.5 py-2">
		<span>●</span>
		<span class="font-bold">Senior Software Engineer</span>
		<span class="ml-auto border-2 px-1.5 py-0.5 text-[10px] tracking-wider">MASTER</span>
	</div>

	<!-- Branch children -->
	<div class="border-foreground ml-2 flex flex-col gap-1.5 border-l-2 pl-3 pt-1">
		<div class="node child-1 border-foreground bg-card flex items-center gap-3 border-2 px-2.5 py-2">
			<span>○</span>
			<span>Backend</span>
			<span class="text-muted-foreground ml-auto border-2 px-1.5 py-0.5 text-[10px] tracking-wider">
				in sync
			</span>
		</div>
		<div class="node child-2 border-foreground bg-card flex items-center gap-3 border-2 px-2.5 py-2">
			<span>○</span>
			<span>Stripe · SWE</span>
			<span class="updated-tag text-accent border-accent ml-auto border-2 px-1.5 py-0.5 text-[10px] tracking-wider">
				updated
			</span>
		</div>
		<div
			class="node child-3 border-foreground text-muted-foreground flex items-center gap-3 border-2 border-dashed px-2.5 py-2"
		>
			<span>+</span>
			<span>tailor a new copy</span>
		</div>
	</div>
</div>

<style>
	/* Staggered fade-in */
	.node {
		opacity: 0;
		animation: fadeSlideUp 0.4s ease forwards;
	}
	.master {
		background: var(--foreground);
		color: var(--card);
		animation-delay: 0.1s;
	}
	.child-1 {
		animation-delay: 0.25s;
	}
	.child-2 {
		animation-delay: 0.4s;
	}
	.child-3 {
		animation-delay: 0.55s;
	}

	/* Pulse on "updated" tag */
	.updated-tag {
		animation:
			fadeSlideUp 0.4s ease 0.4s forwards,
			updatedPulse 2s ease-in-out 1.2s infinite;
	}

	@media (prefers-reduced-motion: no-preference) {
		@keyframes fadeSlideUp {
			from {
				opacity: 0;
				transform: translateY(5px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		@keyframes updatedPulse {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.45;
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.node {
			opacity: 1;
			animation: none;
		}
		.updated-tag {
			animation: none;
		}
	}
</style>
