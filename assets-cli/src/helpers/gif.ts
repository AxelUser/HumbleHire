import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, unlinkSync, existsSync } from 'fs';
import { dirname } from 'path';
import ffmpegPath from 'ffmpeg-static';
import { VIDEO_DIR } from '../paths';
import type { TrimWindow } from './recorder';

const exec = promisify(execFile);

export function getVideoDir(): string {
	mkdirSync(VIDEO_DIR, { recursive: true });
	return VIDEO_DIR;
}

// `bayer` is ordered dithering: blockier than error diffusion in flat gradients,
// but it adds no per-pixel noise, so GIF's LZW compression stays effective —
// the main lever on file size for screen recordings. `sierra2` is the full
// error-diffusion dither (ffmpeg's default, prettiest, largest). `none` is
// flat — smallest, with visible banding.
export type Dither = 'bayer' | 'sierra2' | 'none';

export interface GifEncodeOptions {
	fps: number;
	// palettegen max_colors — fewer colours, smaller file, more banding.
	colors: number;
	// Output width in px; height follows the aspect ratio.
	width: number;
	dither: Dither;
	// bayer matrix size (0–5); higher is finer-grained but slightly larger. Only
	// used when dither is `bayer`.
	bayerScale: number;
}

// Translate the dither choice into the `paletteuse` dither expression.
function ditherExpr({ dither, bayerScale }: GifEncodeOptions): string {
	if (dither === 'bayer') return `dither=bayer:bayer_scale=${bayerScale}`;
	if (dither === 'none') return 'dither=none';
	return 'dither=sierra2_4a';
}

// Input-seek args (placed before `-i`) that trim the source to the kept window.
// `-ss` does a fast seek; `-t` caps the duration read from that point, so it is
// expressed relative to the seek and stays unambiguous across ffmpeg versions.
function trimArgs({ startSec, endSec }: TrimWindow): string[] {
	const args: string[] = [];
	if (startSec !== undefined && startSec > 0) args.push('-ss', startSec.toFixed(3));
	if (endSec !== undefined) {
		const from = startSec ?? 0;
		const duration = Math.max(0, endSec - from);
		args.push('-t', duration.toFixed(3));
	}
	return args;
}

export async function videoToGif(
	videoPath: string,
	outputPath: string,
	trim: TrimWindow,
	opts: GifEncodeOptions
): Promise<void> {
	mkdirSync(dirname(outputPath), { recursive: true });

	if (!ffmpegPath) {
		throw new Error('ffmpeg binary not found');
	}
	const bin = ffmpegPath;

	const palettePath = videoPath + '.palette.png';
	const seek = trimArgs(trim);

	// Shared frame-rate + downscale applied identically to both passes so the
	// palette is generated from the same frames the GIF is built from.
	const scale = `fps=${opts.fps},scale=${opts.width}:-1:flags=lanczos`;

	await exec(bin, [
		...seek,
		'-i',
		videoPath,
		'-vf',
		`${scale},palettegen=max_colors=${opts.colors}`,
		'-y',
		palettePath
	]);

	await exec(bin, [
		...seek,
		'-i',
		videoPath,
		'-i',
		palettePath,
		'-filter_complex',
		`[0:v]${scale}[x];[x][1:v]paletteuse=${ditherExpr(opts)}`,
		'-loop',
		'0',
		'-y',
		outputPath
	]);

	if (existsSync(palettePath)) unlinkSync(palettePath);
}
