import { spawn, type ChildProcess } from 'node:child_process';
import { ROOT_DIR } from './paths';
import type { HarnessConfig } from './config';

// The runner that @playwright/test's `webServer` used to provide. We replicate
// only the slice the harness needs: build the app with the e2e bridge compiled
// in, preview it, wait for the port, and tear the whole process tree down after.

const isWindows = process.platform === 'win32';

// VITE_E2E is read at build time and inlines the window.__hhTest seam, so it must
// be present for `build`; we keep it on `preview` too for symmetry.
const SERVE_ENV = { ...process.env, VITE_E2E: 'true' };

export interface PreviewServer {
	stop(): Promise<void>;
}

function run(command: string, args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: ROOT_DIR,
			env: SERVE_ENV,
			stdio: 'inherit',
			// pnpm resolves to pnpm.cmd on Windows, which needs a shell to launch.
			shell: isWindows
		});
		child.on('error', reject);
		child.on('exit', (code) =>
			code === 0
				? resolve()
				: reject(new Error(`\`${command} ${args.join(' ')}\` exited with ${code}`))
		);
	});
}

async function waitForPort(url: string, timeoutMs = 180_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			// Any HTTP answer (even a 404) means the preview is accepting connections.
			await fetch(url);
			return;
		} catch {
			await new Promise((r) => setTimeout(r, 500));
		}
	}
	throw new Error(`App preview never answered at ${url} within ${timeoutMs}ms`);
}

function killTree(child: ChildProcess): Promise<void> {
	return new Promise((resolve) => {
		if (child.pid === undefined || child.exitCode !== null) return resolve();
		if (isWindows) {
			// The child is a shell wrapping pnpm → vite preview; /T kills the tree.
			spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' }).on(
				'exit',
				() => resolve()
			);
		} else {
			child.kill('SIGTERM');
			resolve();
		}
	});
}

// Build the app and start a preview the harness can drive on the configured port.
// Resolves once the port is answering; the returned handle tears the preview down.
export async function startPreview({ port, baseUrl }: HarnessConfig): Promise<PreviewServer> {
	process.stdout.write('• building app (VITE_E2E)…\n');
	await run('pnpm', ['build']);

	process.stdout.write(`• starting preview on :${port}…\n`);
	const preview = spawn('pnpm', ['preview', '--port', String(port)], {
		cwd: ROOT_DIR,
		env: SERVE_ENV,
		stdio: 'inherit',
		shell: isWindows
	});

	try {
		await waitForPort(baseUrl);
	} catch (err) {
		await killTree(preview);
		throw err;
	}

	process.stdout.write('• preview is up\n');
	return { stop: () => killTree(preview) };
}
