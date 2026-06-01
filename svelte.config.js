import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'node:child_process';

function gitSha() {
	try {
		return execSync('git rev-parse HEAD').toString().trim();
	} catch {
		return 'dev';
	}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		serviceWorker: {
			register: false
		},
		version: {
			name: gitSha()
		}
	}
};

export default config;
