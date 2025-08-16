import type { PageServerLoad } from './$types';
import fs from 'fs/promises';
import path from 'path';

export type SkillIconItem = {
	id: string;
	texts: string[];
	url: string;
};

export const load: PageServerLoad = async () => {
	const dir = path.resolve('static/skills-icons');
	let files: string[] = [];
	try {
		files = await fs.readdir(dir);
	} catch {
		files = [];
	}
	const skillsIcons: SkillIconItem[] = files
		.filter((f) => /\.(svg|png)$/i.test(f))
		.sort()
		.map((file) => {
			const base = file.replace(/\.(svg|png)$/i, '');
			const id = base;
			const words = base.replace(/[-_]/g, ' ').split(/\s+/).filter(Boolean);
			const texts = [base, ...words];
			return { id, texts, url: `/skills-icons/${file}` };
		});
	return { skillsIcons };
};
