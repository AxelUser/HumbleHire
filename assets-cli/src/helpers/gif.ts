import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, unlinkSync, existsSync } from 'fs';
import { dirname } from 'path';
import ffmpegPath from 'ffmpeg-static';
import { VIDEO_DIR } from '../paths';

const exec = promisify(execFile);

export function getVideoDir(): string {
	mkdirSync(VIDEO_DIR, { recursive: true });
	return VIDEO_DIR;
}

export interface TrimWindow {
	// Seconds from the start of the recorded video — everything outside the
	// [startSec, endSec] window is dropped during encoding.
	startSec?: number;
	endSec?: number;
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
	trim: TrimWindow = {}
): Promise<void> {
	mkdirSync(dirname(outputPath), { recursive: true });

	const palettePath = videoPath + '.palette.png';
	const bin = ffmpegPath!;
	const seek = trimArgs(trim);

	await exec(bin, [
		...seek,
		'-i',
		videoPath,
		'-vf',
		'fps=12,scale=960:-1:flags=lanczos,palettegen',
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
		'[0:v]fps=12,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse',
		'-loop',
		'0',
		'-y',
		outputPath
	]);

	if (existsSync(palettePath)) unlinkSync(palettePath);
}
