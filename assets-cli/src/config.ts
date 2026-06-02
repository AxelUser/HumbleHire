import { isAbsolute, resolve } from 'node:path';
import type { ParseArgsConfig } from 'node:util';
import { ROOT_DIR, DEFAULT_OUT_DIR, DEFAULT_PORT } from './paths';
import type { Theme } from './helpers/context';
import type { Dither, GifEncodeOptions } from './helpers/gif';

// The whole tunable surface of a generate run. Built once in the CLI from flags
// and threaded read-only through the runner into each recipe — so nothing in the
// capture or encode code carries a hardcoded number. The canonical values live
// in the `generate` pnpm script; the fallbacks below only apply when a flag is
// omitted.
export interface HarnessConfig {
	outDir: string;
	port: number;
	baseUrl: string;
	themes: Theme[];
	// Pixel density for stills (Playwright deviceScaleFactor).
	deviceScaleFactor: number;
	// Per-recipe wall-clock cap.
	timeoutMs: number;
	gif: GifEncodeOptions;
}

// The flag schema, shared by the parser and the help text.
export const CONFIG_OPTIONS = {
	out: { type: 'string' },
	fps: { type: 'string' },
	colors: { type: 'string' },
	width: { type: 'string' },
	dither: { type: 'string' },
	'bayer-scale': { type: 'string' },
	port: { type: 'string' },
	themes: { type: 'string' },
	scale: { type: 'string' },
	timeout: { type: 'string' },
	help: { type: 'boolean', short: 'h' }
} as const satisfies NonNullable<ParseArgsConfig['options']>;

// What the runtime hands buildConfig: parseArgs string/boolean values, keyed by flag.
type RawValues = Partial<Record<keyof typeof CONFIG_OPTIONS, string | boolean>>;

const DEFAULTS = {
	fps: 10,
	colors: 96,
	width: 900,
	dither: 'bayer' as Dither,
	bayerScale: 3,
	scale: 2,
	timeout: 120_000,
	themes: ['light', 'dark'] as Theme[]
};

const DITHERS: Dither[] = ['bayer', 'sierra2', 'none'];
const THEMES: Theme[] = ['light', 'dark'];

function num(value: string | boolean | undefined, flag: string, fallback: number): number {
	if (value === undefined) return fallback;
	const n = Number(value);
	if (!Number.isFinite(n)) throw new Error(`--${flag} must be a number, got "${String(value)}"`);
	return n;
}

function str(value: string | boolean | undefined): string | undefined {
	return typeof value === 'string' ? value : undefined;
}

export function buildConfig(values: RawValues): HarnessConfig {
	const out = str(values.out);
	const outDir = out ? (isAbsolute(out) ? out : resolve(ROOT_DIR, out)) : DEFAULT_OUT_DIR;

	const dither = (str(values.dither) ?? DEFAULTS.dither) as Dither;
	if (!DITHERS.includes(dither)) {
		throw new Error(`--dither must be one of ${DITHERS.join(' | ')}, got "${dither}"`);
	}

	const themesRaw = str(values.themes);
	const themes = (
		themesRaw ? themesRaw.split(',').map((t) => t.trim()) : DEFAULTS.themes
	) as Theme[];
	for (const t of themes) {
		if (!THEMES.includes(t)) throw new Error(`--themes must be ${THEMES.join('/')}, got "${t}"`);
	}

	const port = num(values.port, 'port', DEFAULT_PORT);

	return {
		outDir,
		port,
		baseUrl: `http://localhost:${port}`,
		themes,
		deviceScaleFactor: num(values.scale, 'scale', DEFAULTS.scale),
		timeoutMs: num(values.timeout, 'timeout', DEFAULTS.timeout),
		gif: {
			fps: num(values.fps, 'fps', DEFAULTS.fps),
			colors: num(values.colors, 'colors', DEFAULTS.colors),
			width: num(values.width, 'width', DEFAULTS.width),
			dither,
			bayerScale: num(values['bayer-scale'], 'bayer-scale', DEFAULTS.bayerScale)
		}
	};
}
