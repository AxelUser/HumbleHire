import Dexie, { type Table } from 'dexie';
import type { CV } from '$lib/types/cv';

class HumbleHireDB extends Dexie {
	cvs!: Table<CV>;

	constructor() {
		super('humblehire');
		this.version(1).stores({
			cvs: 'id, updatedAt, sourceId'
		});
	}
}

export const db = new HumbleHireDB();
