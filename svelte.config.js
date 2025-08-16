import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		prerender: {
			crawl: true
		},
		alias: {
			'@ui': 'src/lib/components/ui',
			'@shared': 'src/lib/components/shared'
		}
	}
};

export default config;
