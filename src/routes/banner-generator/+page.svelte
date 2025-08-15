<script lang="ts">
	import { BannerGenerator } from '$lib/components/banner-generator';
	import { SEO } from '@shared/seo';

	let { data } = $props();
</script>

<SEO title="Banner Generator" description="Generate a banner for your LinkedIn profile" />
<BannerGenerator skillsIcons={data.skillsIcons} />
