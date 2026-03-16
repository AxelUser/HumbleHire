<script lang="ts">
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

	interface Props {
		value: string;
		placeholder?: string;
		class?: string;
		rows?: number;
	}

	let { value = $bindable(), placeholder, class: className, rows = 3 }: Props = $props();

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

	function onTextareaKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' || event.key === 'Tab') {
			deactivate();
		}
	}
</script>

{#if editing}
	<Textarea
		bind:value
		{placeholder}
		{rows}
		class={className}
		autofocus
		onblur={deactivate}
		onkeydown={onTextareaKeydown}
	/>
{:else}
	<span
		role="button"
		tabindex="0"
		class="hover:outline-1 hover:outline-ring/40 rounded cursor-text whitespace-pre-wrap {className ?? ''}"
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
