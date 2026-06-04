import { defineConfig } from '@playwright/test';

const useDevServer = !!process.env.PW_DEV;

export default defineConfig({
	reporter: process.env.CI ? 'github' : 'html',
	retries: process.env.CI ? 2 : 0,
	webServer: {
		command: useDevServer ? 'pnpm dev --port 4777' : 'pnpm build && pnpm preview --port 4777',
		env: { VITE_DEV_BRIDGE: 'true', VITE_DEV_NO_SW: 'true' },
		port: 4777,
		timeout: 120_000,
		reuseExistingServer: !process.env.CI
	},

	testDir: 'e2e',

	use: {
		trace: 'on-first-retry',
		baseURL: 'http://localhost:4777',
		actionTimeout: 10_000,
		acceptDownloads: true
	}
});
