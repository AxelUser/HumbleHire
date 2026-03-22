<script lang="ts">
  import { mode } from 'mode-watcher';
  import logoDark from '$lib/assets/logo/humblehire_logo_dark.avif';
  import logoLight from '$lib/assets/logo/humblehire_logo_light.avif';

  let { class: className }: { class?: string } = $props();
</script>

<img src={mode.current === 'dark' ? logoDark : logoLight} alt="HumbleHire" class={className} />
