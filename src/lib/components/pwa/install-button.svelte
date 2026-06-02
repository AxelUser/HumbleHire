<script lang="ts">
	import Download from '@lucide/svelte/icons/download';

	let {
		canInstall = false,
		isIos = false,
		onclick
	}: {
		canInstall?: boolean;
		isIos?: boolean;
		onclick?: () => void;
	} = $props();
</script>

{#if canInstall || isIos}
	<button
		{onclick}
		class="border-foreground bg-background shadow-brutal-sm hover-brutal inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-bold"
		title="Install HumbleHire to keep your CVs safe on this device"
	>
		<Download class="h-4 w-4" />
		Install app
	</button>
{/if}
