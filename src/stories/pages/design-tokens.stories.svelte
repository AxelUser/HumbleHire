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
