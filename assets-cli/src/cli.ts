import { generateAll } from './runner';

const HELP = `docs-assets — regenerate HumbleHire documentation assets

Usage:
  docs-assets generate    Build the app, drive it headless, and write the
                          PNGs and GIFs in docs/assets (both light and dark).
  docs-assets help        Show this message.
`;

async function main(): Promise<void> {
	const command = process.argv[2] ?? 'generate';

	switch (command) {
		case 'generate':
			await generateAll();
			return;
		case 'help':
		case '-h':
		case '--help':
			process.stdout.write(HELP);
			return;
		default:
			process.stderr.write(`Unknown command: ${command}\n\n${HELP}`);
			process.exitCode = 1;
	}
}

main().catch((err) => {
	process.stderr.write(`${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
	process.exitCode = 1;
});
