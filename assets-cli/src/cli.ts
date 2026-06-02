import { parseArgs } from 'node:util';
import { buildConfig, CONFIG_OPTIONS } from './config';
import { generateAll } from './runner';

const HELP = `docs-assets — regenerate HumbleHire documentation assets

Usage:
  docs-assets generate [flags]   Build the app, drive it headless, and write the
                                 PNGs and GIFs to the output dir.
  docs-assets help               Show this message.

Flags (canonical values live in the \`generate\` pnpm script; these are fallbacks):
  --out <dir>          Output directory; relative paths resolve from the repo root.
  --fps <n>            GIF frame rate.
  --colors <n>         GIF palette size (palettegen max_colors).
  --width <px>         GIF width; height follows the aspect ratio.
  --dither <mode>      bayer | sierra2 | none. bayer is smallest; sierra2 prettiest.
  --bayer-scale <0-5>  Bayer matrix size (only with --dither bayer).
  --port <n>           Port the app preview is served on.
  --themes <list>      Comma-separated subset of: light,dark.
  --scale <n>          deviceScaleFactor for PNG stills.
  --timeout <ms>       Per-recipe wall-clock cap.
`;

async function main(): Promise<void> {
	const { values, positionals } = parseArgs({
		args: process.argv.slice(2),
		allowPositionals: true,
		options: CONFIG_OPTIONS
	});

	const command = positionals[0] ?? 'generate';

	if (values.help || command === 'help') {
		process.stdout.write(HELP);
		return;
	}

	if (command === 'generate') {
		await generateAll(buildConfig(values));
		return;
	}

	process.stderr.write(`Unknown command: ${command}\n\n${HELP}`);
	process.exitCode = 1;
}

main().catch((err) => {
	process.stderr.write(`${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`);
	process.exitCode = 1;
});
