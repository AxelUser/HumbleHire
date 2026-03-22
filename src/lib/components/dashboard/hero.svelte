<script lang="ts">
	import { Logo } from '$lib/components/ui/logo';
	import { Monitor, Check } from '@lucide/svelte';
</script>

<!-- Hero -->
<div class="border-foreground bg-card border-b-2 px-6 py-10">
	<div class="mx-auto max-w-5xl">
		<div class="flex flex-col gap-10 md:flex-row md:items-center">
			<!-- Left: text -->
			<div class="flex-1">
				<div
					class="border-accent text-accent mb-3 inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs font-bold tracking-widest uppercase"
				>
					✦ Version controlled
				</div>
				<h1 class="mb-2 text-4xl font-extrabold tracking-tight">
					<Logo class="inline-block h-20 w-auto" />
					One CV. <em class="text-accent not-italic">Many targets.</em>
				</h1>
				<p class="text-muted-foreground text-base font-medium">
					Fork your master, tweak it per job, and always know which version went where.
				</p>
			</div>

			<!-- Right: feature panel grid -->
			<div class="w-full shrink-0 md:w-[420px]">
				<div class="grid grid-cols-2 gap-3" style="grid-template-rows: auto auto;">
					<!-- Panel A: Branch (full width) -->
					<div
						class="border-foreground bg-background shadow-brutal col-span-2 overflow-hidden border-2 p-4"
					>
						<p class="text-accent mb-1 text-xs font-bold tracking-widest uppercase">↳ Branch</p>
						<p class="mb-3 text-sm font-extrabold">One master. Many variants.</p>
						<div class="branch-diagram relative flex flex-col gap-2 font-mono text-xs">
							<div class="branch-node node-master flex items-center gap-2">
								<span
									class="node-dot border-foreground bg-accent h-3 w-3 shrink-0 rounded-full border-2"
								></span>
								<span class="font-bold">Master CV</span>
							</div>
							<div
								class="branch-children border-foreground ml-1.5 flex flex-col gap-2 border-l-2 pl-3"
							>
								<div class="branch-node node-child1 flex items-center gap-2">
									<span
										class="node-dot border-foreground bg-card h-2.5 w-2.5 shrink-0 rounded-full border-2"
									></span>
									<span>Google SWE ↗</span>
								</div>
								<div class="branch-node node-child2 flex items-center gap-2">
									<span
										class="node-dot border-foreground bg-card h-2.5 w-2.5 shrink-0 rounded-full border-2"
									></span>
									<span>Amazon IC5 ↗</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Panel B: History -->
					<div class="border-foreground bg-background shadow-brutal overflow-hidden border-2 p-4">
						<p class="text-accent mb-1 text-xs font-bold tracking-widest uppercase">↳ History</p>
						<p class="mb-3 text-sm font-extrabold">Every save, tracked.</p>
						<div class="flex flex-col font-mono text-xs">
							<div class="history-entry entry-1 flex items-start gap-2">
								<div class="flex flex-col items-center">
									<span
										class="border-foreground bg-accent h-2.5 w-2.5 shrink-0 rounded-full border-2"
									></span>
									<span class="bg-foreground/30 h-4 w-0.5"></span>
								</div>
								<span class="leading-tight">v3 · just now</span>
							</div>
							<div class="history-entry entry-2 flex items-start gap-2">
								<div class="flex flex-col items-center">
									<span class="border-foreground bg-card h-2.5 w-2.5 shrink-0 rounded-full border-2"
									></span>
									<span class="bg-foreground/30 h-4 w-0.5"></span>
								</div>
								<span class="leading-tight">v2 · 1h ago</span>
							</div>
							<div class="history-entry entry-3 flex items-start gap-2">
								<div class="flex flex-col items-center">
									<span class="border-foreground bg-card h-2.5 w-2.5 shrink-0 rounded-full border-2"
									></span>
								</div>
								<span class="leading-tight">v1 · yesterday</span>
							</div>
						</div>
					</div>

					<!-- Panel C: Local-first -->
					<div
						class="border-foreground bg-background shadow-brutal flex flex-col overflow-hidden border-2 p-4"
					>
						<p class="text-accent mb-1 text-xs font-bold tracking-widest uppercase">
							↳ Local-first
						</p>
						<p class="mb-3 text-sm font-extrabold">Your data. Your machine.</p>
						<div class="flex flex-1 flex-col items-center justify-center gap-2">
							<div
								class="local-icon border-foreground bg-card relative flex h-12 w-12 items-center justify-center border-2"
							>
								<Monitor class="h-6 w-6" stroke-width={2} />
								<div
									class="check-badge border-foreground bg-accent text-background absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border-2"
								>
									<Check class="h-3 w-3" stroke-width={3} />
								</div>
							</div>
							<p class="text-center text-xs font-bold">No account. No cloud.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Branch diagram staggered fade-in */
	.branch-node {
		opacity: 0;
		animation: fadeSlideUp 0.4s ease forwards;
	}
	.node-master {
		animation-delay: 0.1s;
	}
	.node-child1 {
		animation-delay: 0.3s;
	}
	.node-child2 {
		animation-delay: 0.5s;
	}

	/* History entries staggered */
	.history-entry {
		opacity: 0;
		animation: fadeSlideUp 0.4s ease forwards;
	}
	.entry-1 {
		animation-delay: 0.1s;
	}
	.entry-2 {
		animation-delay: 0.25s;
	}
	.entry-3 {
		animation-delay: 0.4s;
	}

	/* Local-first check pulse */
	.check-badge {
		animation: pulse 2s ease-in-out infinite;
		animation-delay: 0.8s;
	}

	@keyframes fadeSlideUp {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
	}
</style>
