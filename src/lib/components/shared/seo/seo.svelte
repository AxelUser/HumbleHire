<script lang="ts">
	export let title: string = 'HumbleHire';
	export let description: string = '';
	export let url: string = '';
	export let image: string = '';
	export let type: string = 'website';
	export let robots: string = 'index,follow';
	export let siteName: string = 'HumbleHire';
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if robots}
		<meta name="robots" content={robots} />
	{/if}
	{#if url}
		<link rel="canonical" href={url} />
		<meta property="og:url" content={url} />
	{/if}
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={siteName} />
	{#if title}
		<meta property="og:title" content={title} />
		<meta name="twitter:title" content={title} />
	{/if}
	{#if description}
		<meta property="og:description" content={description} />
		<meta name="twitter:description" content={description} />
	{/if}
	{#if image}
		<meta property="og:image" content={image} />
		<meta name="twitter:image" content={image} />
	{/if}
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
</svelte:head>
