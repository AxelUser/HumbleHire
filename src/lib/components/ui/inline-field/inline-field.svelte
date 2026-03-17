<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';

	interface Props {
		value: string;
		placeholder?: string;
		class?: string;
	}

	let { value = $bindable(), placeholder, class: className }: Props = $props();

	let editing = $state(false);

	function activate() {
		editing = true;
	}

	function deactivate() {
		editing = false;
	}

	function onSpanKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			activate();
		}
	}

	function onInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' || event.key === 'Tab') {
			deactivate();
		}
	}
</script>

{#if editing}
	<Input
		bind:value
		{placeholder}
		class={className}
		autofocus
		onblur={deactivate}
		onkeydown={onInputKeydown}
	/>
{:else}
	<span
		role="button"
		tabindex="0"
		class="hover:outline hover:outline-1 hover:outline-ring/40 cursor-text {className ?? ''}"
		onclick={activate}
		onkeydown={onSpanKeydown}
	>
		{#if value}
			{value}
		{:else if placeholder}
			<span class="text-muted-foreground">{placeholder}</span>
		{/if}
	</span>
{/if}
