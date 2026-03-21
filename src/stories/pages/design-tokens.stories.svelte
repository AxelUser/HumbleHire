<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Pages/DesignTokens',
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="ColorSwatches">
		<div class="p-8 bg-background min-h-screen">
			<h1 class="text-2xl font-bold mb-6">Design Tokens</h1>

			<h2 class="text-lg font-bold mb-3 uppercase tracking-widest text-xs">Colors</h2>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
				{#each [
					{ name: 'background', var: '--background' },
					{ name: 'foreground', var: '--foreground' },
					{ name: 'card', var: '--card' },
					{ name: 'primary', var: '--primary' },
					{ name: 'primary-fg', var: '--primary-foreground' },
					{ name: 'secondary', var: '--secondary' },
					{ name: 'muted', var: '--muted' },
					{ name: 'accent', var: '--accent' },
					{ name: 'destructive', var: '--destructive' },
					{ name: 'border', var: '--border' },
					{ name: 'input', var: '--input' },
					{ name: 'ring', var: '--ring' }
				] as token (token.var)}
					<div class="border-2 border-foreground">
						<div class="h-12" style="background-color: var({token.var})"></div>
						<div class="px-2 py-1.5 bg-card">
							<p class="text-xs font-bold">{token.name}</p>
							<p class="text-xs text-muted-foreground font-mono">{token.var}</p>
						</div>
					</div>
				{/each}
			</div>

			<h2 class="text-lg font-bold mb-3 uppercase tracking-widest text-xs">Typography Scale</h2>
			<div class="flex flex-col gap-3 mb-8">
				<p class="text-4xl font-extrabold">Heading 1 — 4xl ExtraBold</p>
				<p class="text-3xl font-bold">Heading 2 — 3xl Bold</p>
				<p class="text-2xl font-bold">Heading 3 — 2xl Bold</p>
				<p class="text-xl font-semibold">Heading 4 — xl Semibold</p>
				<p class="text-base">Body text — base regular</p>
				<p class="text-sm text-muted-foreground">Small text — sm muted</p>
				<p class="text-xs uppercase tracking-widest font-bold">Label — xs uppercase bold</p>
			</div>

			<h2 class="text-lg font-bold mb-3 uppercase tracking-widest text-xs">Shadows</h2>
			<div class="flex flex-wrap gap-6 mb-8">
				<div class="w-24 h-16 bg-card border-2 border-foreground shadow-brutal flex items-center justify-center text-xs font-bold">brutal</div>
				<div class="w-24 h-16 bg-card border-2 border-foreground shadow-brutal-sm flex items-center justify-center text-xs font-bold">brutal-sm</div>
			</div>
		</div>
</Story>

<Story name="BlockSpacing">
	<div class="p-8 bg-background min-h-screen max-w-2xl">
		<h1 class="text-2xl font-bold mb-6">Block Spacing Rules</h1>

		<h2 class="text-lg font-bold mb-3 uppercase tracking-widest text-xs">Spacing Tokens</h2>
		<div class="flex flex-col gap-4 mb-8">
			{#each [
				{ name: 'Entry card gap', class: 'gap-4', px: 16, desc: 'Between entry cards' },
				{ name: 'Field gap', class: 'gap-2', px: 8, desc: 'Between fields within a card' },
				{ name: 'List item gap', class: 'gap-1.5', px: 6, desc: 'Between bullet items' },
				{ name: 'Inline gap', class: 'gap-2', px: 8, desc: 'Same-row elements' },
				{ name: 'Entry padding', class: 'p-4', px: 16, desc: 'Internal card padding' },
				{ name: 'Add button margin', class: 'mt-2', px: 8, desc: 'Above Add buttons' }
			] as token (token.name)}
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1 shrink-0">
						<div class="bg-accent" style="width: {token.px * 2}px; height: 12px;"></div>
					</div>
					<div class="shrink-0 w-12 text-right">
						<span class="text-sm font-bold font-mono">{token.px}px</span>
					</div>
					<div class="flex flex-col">
						<span class="text-sm font-bold">{token.name} <code class="text-xs text-muted-foreground font-mono ml-1">{token.class}</code></span>
						<span class="text-xs text-muted-foreground">{token.desc}</span>
					</div>
				</div>
			{/each}
		</div>

		<h2 class="text-lg font-bold mb-3 uppercase tracking-widest text-xs">Visual Hierarchy</h2>
		<div class="border-2 border-foreground bg-card p-4">
			<span class="text-xs font-bold uppercase tracking-widest">PanelCard (px-4 py-4)</span>
			<div class="mt-3 flex flex-col gap-4">
				<!-- Card 1 -->
				<div class="border-2 border-foreground/30 rounded-lg p-4">
					<span class="text-xs text-muted-foreground font-mono mb-2 block">Entry card (p-4, border rounded-lg)</span>
					<div class="flex flex-col gap-2">
						<div class="bg-muted h-8 flex items-center px-2">
							<span class="text-xs text-muted-foreground">Header row</span>
							<span class="text-xs text-muted-foreground ml-auto font-mono">gap-2 inline</span>
						</div>
						<div class="bg-muted h-8 flex items-center px-2">
							<span class="text-xs text-muted-foreground">Text field</span>
							<span class="text-xs text-muted-foreground ml-auto font-mono">gap-2</span>
						</div>
						<div class="bg-muted h-8 flex items-center px-2">
							<span class="text-xs text-muted-foreground">Date row</span>
							<span class="text-xs text-muted-foreground ml-auto font-mono">gap-2 inline</span>
						</div>
					</div>
					<!-- gap-2 annotation -->
					<div class="flex items-center mt-2">
						<div class="flex-1 border-t border-dashed border-accent"></div>
						<span class="text-xs font-mono text-accent px-2">fields: gap-2 (8px)</span>
						<div class="flex-1 border-t border-dashed border-accent"></div>
					</div>
				</div>
				<!-- Card 2 -->
				<div class="border-2 border-foreground/30 rounded-lg p-4">
					<span class="text-xs text-muted-foreground font-mono mb-2 block">Entry card 2</span>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center gap-2">
							<span class="text-lg leading-none text-muted-foreground">■</span>
							<div class="bg-muted h-6 flex-1 flex items-center px-2">
								<span class="text-xs text-muted-foreground">Bullet item</span>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-lg leading-none text-muted-foreground">■</span>
							<div class="bg-muted h-6 flex-1 flex items-center px-2">
								<span class="text-xs text-muted-foreground">Bullet item</span>
							</div>
						</div>
					</div>
					<div class="flex items-center mt-2">
						<div class="flex-1 border-t border-dashed border-accent"></div>
						<span class="text-xs font-mono text-accent px-2">list items: gap-1.5 (6px)</span>
						<div class="flex-1 border-t border-dashed border-accent"></div>
					</div>
				</div>
			</div>
			<!-- gap-4 annotation -->
			<div class="flex items-center mt-3">
				<div class="flex-1 border-t border-dashed border-accent"></div>
				<span class="text-xs font-mono text-accent px-2">cards: gap-4 (16px)</span>
				<div class="flex-1 border-t border-dashed border-accent"></div>
			</div>
		</div>

		<h2 class="text-lg font-bold mt-8 mb-3 uppercase tracking-widest text-xs">Rules</h2>
		<div class="flex flex-col gap-2 text-sm">
			<p><span class="font-bold">1.</span> Use <code class="font-mono text-xs bg-muted px-1">gap</code> on parent, not <code class="font-mono text-xs bg-muted px-1">mb-*</code> on children</p>
			<p><span class="font-bold">2.</span> Card internals: <code class="font-mono text-xs bg-muted px-1">flex flex-col gap-2</code></p>
			<p><span class="font-bold">3.</span> EditableList: <code class="font-mono text-xs bg-muted px-1">gap-1.5</code> for denser bullet items</p>
			<p><span class="font-bold">4.</span> Entry cards: <code class="font-mono text-xs bg-muted px-1">border rounded-lg p-4</code> — no margin classes</p>
			<p><span class="font-bold">5.</span> Add buttons: <code class="font-mono text-xs bg-muted px-1">mt-2</code> in flat lists, inherits <code class="font-mono text-xs bg-muted px-1">gap-4</code> in card blocks</p>
		</div>
	</div>
</Story>
