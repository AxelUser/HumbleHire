import { defineConfig } from '@playwright/test';

const useDevServer = !!process.env.PW_DEV;

export default defineConfig({
	reporter: 'html',
	retries: 0,
	timeout: 120_000,
	webServer: {
		command: useDevServer ? 'pnpm dev --port 4888' : 'pnpm build && pnpm preview --port 4888',
		env: { VITE_E2E: 'true' },
		port: 4888,
		timeout: 180_000,
		reuseExistingServer: true
	},
	testDir: 'assets',
	testMatch: '**/*.assets.ts',
	use: {
		baseURL: 'http://localhost:4888',
		actionTimeout: 15_000
	},
	outputDir: 'assets-output',
	projects: [{ name: 'light' }, { name: 'dark' }]
});
