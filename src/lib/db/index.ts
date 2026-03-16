import Dexie, { type Table } from 'dexie';
import type { CV, CVVersion } from '$lib/types/cv';

class HumbleHireDB extends Dexie {
	cvs!: Table<CV>;
	versions!: Table<CVVersion>;

	constructor() {
		super('humblehire');
		this.version(1).stores({
			cvs: 'id, updatedAt',
			versions: 'id, cvId, createdAt'
		});
	}
}

export const db = new HumbleHireDB();
