<script lang="ts">
	import logoDark from '$lib/assets/logo/humblehire_logo_dark.avif';
	import logoLight from '$lib/assets/logo/humblehire_logo_light.avif';
	import { cn } from '$lib/utils.js';

	let { class: className }: { class?: string } = $props();
</script>

<img src={logoLight} alt="HumbleHire" class={cn(className, 'dark:hidden')} />
<img src={logoDark} alt="HumbleHire" class={cn(className, 'hidden dark:block')} />
