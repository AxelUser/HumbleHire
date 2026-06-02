import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, unlinkSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import ffmpegPath from 'ffmpeg-static';

const exec = promisify(execFile);

const TEMP_DIR = join(process.cwd(), 'assets-output', 'videos');

export function getVideoDir(): string {
	mkdirSync(TEMP_DIR, { recursive: true });
	return TEMP_DIR;
}

export async function videoToGif(videoPath: string, outputPath: string): Promise<void> {
	mkdirSync(dirname(outputPath), { recursive: true });

	const palettePath = videoPath + '.palette.png';
	const bin = ffmpegPath!;

	await exec(bin, [
		'-i',
		videoPath,
		'-vf',
		'fps=12,scale=960:-1:flags=lanczos,palettegen',
		'-y',
		palettePath
	]);

	await exec(bin, [
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
