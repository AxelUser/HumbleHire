<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Pages/DesignTokens',
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="ColorSwatches">
	<div class="bg-background min-h-screen p-8">
		<h1 class="mb-6 text-2xl font-bold">Design Tokens</h1>

		<h2 class="mb-3 text-lg text-xs font-bold tracking-widest uppercase">Colors</h2>
		<div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each [{ name: 'background', var: '--background' }, { name: 'foreground', var: '--foreground' }, { name: 'card', var: '--card' }, { name: 'primary', var: '--primary' }, { name: 'primary-fg', var: '--primary-foreground' }, { name: 'secondary', var: '--secondary' }, { name: 'muted', var: '--muted' }, { name: 'accent', var: '--accent' }, { name: 'destructive', var: '--destructive' }, { name: 'border', var: '--border' }, { name: 'input', var: '--input' }, { name: 'ring', var: '--ring' }] as token (token.var)}
				<div class="border-foreground border-2">
					<div class="h-12" style="background-color: var({token.var})"></div>
					<div class="bg-card px-2 py-1.5">
						<p class="text-xs font-bold">{token.name}</p>
						<p class="text-muted-foreground font-mono text-xs">{token.var}</p>
					</div>
				</div>
			{/each}
		</div>

		<h2 class="mb-3 text-lg text-xs font-bold tracking-widest uppercase">Typography Scale</h2>
		<div class="mb-8 flex flex-col gap-3">
			<p class="text-4xl font-extrabold">Heading 1 — 4xl ExtraBold</p>
			<p class="text-3xl font-bold">Heading 2 — 3xl Bold</p>
			<p class="text-2xl font-bold">Heading 3 — 2xl Bold</p>
			<p class="text-xl font-semibold">Heading 4 — xl Semibold</p>
			<p class="text-base">Body text — base regular</p>
			<p class="text-muted-foreground text-sm">Small text — sm muted</p>
			<p class="text-xs font-bold tracking-widest uppercase">Label — xs uppercase bold</p>
		</div>

		<h2 class="mb-3 text-lg text-xs font-bold tracking-widest uppercase">Shadows</h2>
		<div class="mb-8 flex flex-wrap gap-6">
			<div
				class="bg-card border-foreground shadow-brutal flex h-16 w-24 items-center justify-center border-2 text-xs font-bold"
			>
				brutal
			</div>
			<div
				class="bg-card border-foreground shadow-brutal-sm flex h-16 w-24 items-center justify-center border-2 text-xs font-bold"
			>
				brutal-sm
			</div>
		</div>
	</div>
</Story>

<Story name="BlockSpacing">
	<div class="bg-background min-h-screen max-w-2xl p-8">
		<h1 class="mb-6 text-2xl font-bold">Block Spacing Rules</h1>

		<h2 class="mb-3 text-lg text-xs font-bold tracking-widest uppercase">Spacing Tokens</h2>
		<div class="mb-8 flex flex-col gap-4">
			{#each [{ name: 'Entry card gap', class: 'gap-4', px: 16, desc: 'Between entry cards' }, { name: 'Field gap', class: 'gap-2', px: 8, desc: 'Between fields within a card' }, { name: 'List item gap', class: 'gap-1.5', px: 6, desc: 'Between bullet items' }, { name: 'Inline gap', class: 'gap-2', px: 8, desc: 'Same-row elements' }, { name: 'Entry padding', class: 'p-4', px: 16, desc: 'Internal card padding' }, { name: 'Add button margin', class: 'mt-2', px: 8, desc: 'Above Add buttons' }] as token (token.name)}
				<div class="flex items-center gap-3">
					<div class="flex shrink-0 items-center gap-1">
						<div class="bg-accent" style="width: {token.px * 2}px; height: 12px;"></div>
					</div>
					<div class="w-12 shrink-0 text-right">
						<span class="font-mono text-sm font-bold">{token.px}px</span>
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-bold"
							>{token.name}
							<code class="text-muted-foreground ml-1 font-mono text-xs">{token.class}</code></span
						>
						<span class="text-muted-foreground text-xs">{token.desc}</span>
					</div>
				</div>
			{/each}
		</div>

		<h2 class="mb-3 text-lg text-xs font-bold tracking-widest uppercase">Visual Hierarchy</h2>
		<div class="border-foreground bg-card border-2 p-4">
			<span class="text-xs font-bold tracking-widest uppercase">PanelCard (px-4 py-4)</span>
			<div class="mt-3 flex flex-col gap-4">
				<!-- Card 1 -->
				<div class="border-foreground/30 rounded-lg border-2 p-4">
					<span class="text-muted-foreground mb-2 block font-mono text-xs"
						>Entry card (p-4, border rounded-lg)</span
					>
					<div class="flex flex-col gap-2">
						<div class="bg-muted flex h-8 items-center px-2">
							<span class="text-muted-foreground text-xs">Header row</span>
							<span class="text-muted-foreground ml-auto font-mono text-xs">gap-2 inline</span>
						</div>
						<div class="bg-muted flex h-8 items-center px-2">
							<span class="text-muted-foreground text-xs">Text field</span>
							<span class="text-muted-foreground ml-auto font-mono text-xs">gap-2</span>
						</div>
						<div class="bg-muted flex h-8 items-center px-2">
							<span class="text-muted-foreground text-xs">Date row</span>
							<span class="text-muted-foreground ml-auto font-mono text-xs">gap-2 inline</span>
						</div>
					</div>
					<!-- gap-2 annotation -->
					<div class="mt-2 flex items-center">
						<div class="border-accent flex-1 border-t border-dashed"></div>
						<span class="text-accent px-2 font-mono text-xs">fields: gap-2 (8px)</span>
						<div class="border-accent flex-1 border-t border-dashed"></div>
					</div>
				</div>
				<!-- Card 2 -->
				<div class="border-foreground/30 rounded-lg border-2 p-4">
					<span class="text-muted-foreground mb-2 block font-mono text-xs">Entry card 2</span>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground text-lg leading-none">■</span>
							<div class="bg-muted flex h-6 flex-1 items-center px-2">
								<span class="text-muted-foreground text-xs">Bullet item</span>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground text-lg leading-none">■</span>
							<div class="bg-muted flex h-6 flex-1 items-center px-2">
								<span class="text-muted-foreground text-xs">Bullet item</span>
							</div>
						</div>
					</div>
					<div class="mt-2 flex items-center">
						<div class="border-accent flex-1 border-t border-dashed"></div>
						<span class="text-accent px-2 font-mono text-xs">list items: gap-1.5 (6px)</span>
						<div class="border-accent flex-1 border-t border-dashed"></div>
					</div>
				</div>
			</div>
			<!-- gap-4 annotation -->
			<div class="mt-3 flex items-center">
				<div class="border-accent flex-1 border-t border-dashed"></div>
				<span class="text-accent px-2 font-mono text-xs">cards: gap-4 (16px)</span>
				<div class="border-accent flex-1 border-t border-dashed"></div>
			</div>
		</div>

		<h2 class="mt-8 mb-3 text-lg text-xs font-bold tracking-widest uppercase">Rules</h2>
		<div class="flex flex-col gap-2 text-sm">
			<p>
				<span class="font-bold">1.</span> Use
				<code class="bg-muted px-1 font-mono text-xs">gap</code>
				on parent, not <code class="bg-muted px-1 font-mono text-xs">mb-*</code> on children
			</p>
			<p>
				<span class="font-bold">2.</span> Card internals:
				<code class="bg-muted px-1 font-mono text-xs">flex flex-col gap-2</code>
			</p>
			<p>
				<span class="font-bold">3.</span> EditableList:
				<code class="bg-muted px-1 font-mono text-xs">gap-1.5</code> for denser bullet items
			</p>
			<p>
				<span class="font-bold">4.</span> Entry cards:
				<code class="bg-muted px-1 font-mono text-xs">border rounded-lg p-4</code> — no margin classes
			</p>
			<p>
				<span class="font-bold">5.</span> Add buttons:
				<code class="bg-muted px-1 font-mono text-xs">mt-2</code>
				in flat lists, inherits <code class="bg-muted px-1 font-mono text-xs">gap-4</code> in card blocks
			</p>
		</div>
	</div>
</Story>
