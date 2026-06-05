import { spawn, type ChildProcess } from 'node:child_process';
import { ROOT_DIR } from './paths';
import type { HarnessConfig } from './config';

// The runner that @playwright/test's `webServer` used to provide. We replicate
// only the slice the harness needs: build the app with the e2e bridge compiled
// in, preview it, wait for the port, and tear the whole process tree down after.

const isWindows = process.platform === 'win32';

// VITE_DEV_BRIDGE inlines the window.__devBridge seam; VITE_DEV_NO_SW disables the service
// worker so the harness doesn't fight a caching SW. Both must be present for `build`;
// we keep them on `preview` too for symmetry.
const SERVE_ENV = { ...process.env, VITE_DEV_BRIDGE: 'true', VITE_DEV_NO_SW: 'true' };

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

const GRACEFUL_SHUTDOWN_MS = 3_000;

function hasExited(child: ChildProcess): boolean {
	return child.exitCode !== null || child.signalCode !== null;
}

function waitForExit(child: ChildProcess, timeoutMs?: number): Promise<void> {
	if (hasExited(child)) return Promise.resolve();
	return new Promise((resolve) => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		if (timeoutMs !== undefined) {
			timer = setTimeout(resolve, timeoutMs);
		}
		child.once('exit', () => {
			if (timer !== undefined) clearTimeout(timer);
			resolve();
		});
	});
}

async function killTree(child: ChildProcess): Promise<void> {
	if (child.pid === undefined || hasExited(child)) return;

	if (isWindows) {
		// The child is a shell wrapping pnpm → vite preview; /T reaches the tree.
		spawn('taskkill', ['/pid', String(child.pid), '/T'], { stdio: 'ignore' });
	} else {
		// Preview is spawned detached so pnpm leads its own group; -pid reaches vite too.
		process.kill(-child.pid, 'SIGTERM');
	}

	await waitForExit(child, GRACEFUL_SHUTDOWN_MS);

	if (!hasExited(child)) {
		if (isWindows) {
			await new Promise<void>((resolve) => {
				spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' }).on(
					'exit',
					() => resolve()
				);
			});
			await waitForExit(child);
		} else {
			process.kill(-child.pid, 'SIGKILL');
			await waitForExit(child);
		}
	}
}

// Build the app and start a preview the harness can drive on the configured port.
// Resolves once the port is answering; the returned handle tears the preview down.
export async function startPreview({ port, baseUrl }: HarnessConfig): Promise<PreviewServer> {
	process.stdout.write('• building app (VITE_DEV_BRIDGE)…\n');
	await run('pnpm', ['build']);

	process.stdout.write(`• starting preview on :${port}…\n`);
	const preview = spawn('pnpm', ['preview', '--port', String(port)], {
		cwd: ROOT_DIR,
		env: SERVE_ENV,
		stdio: 'inherit',
		shell: isWindows,
		// Own process group on POSIX so killTree can signal pnpm and vite together.
		detached: !isWindows
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
