import { db } from '$lib/db/index';
import { capture } from '$lib/analytics';
import { createCV } from './create';

export type CvCreationSource = 'hero' | 'dashboard';

// TODO: to some chores in this directory one day, it's starts to look disorganized.
export async function addBlankCv(source: CvCreationSource): Promise<string> {
	const cv = createCV({ name: 'Untitled CV' });
	await db.cvs.add(cv);
	capture('cv_created', { source });
	return cv.id;
}
