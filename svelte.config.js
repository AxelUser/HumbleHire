import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Root-relative %sveltekit.assets% links (manifest, favicons), relative URLs break on /cv/[id].
		paths: { relative: false },
		adapter: adapter({ fallback: 'index.html' }),
		serviceWorker: {
			register: false
		},
		version: {
			name: version
		}
	}
};

export default config;
