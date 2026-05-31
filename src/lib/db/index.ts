import Dexie, { type Table } from 'dexie';
import type { CV } from '$lib/types/cv';
import { setHasCvsHint } from '$lib/services/cv/has-cvs-hint';
import { ensurePersistent } from '$lib/pwa/persistence';

class HumbleHireDB extends Dexie {
	cvs!: Table<CV>;

	constructor() {
		super('humblehire');
		this.version(1).stores({
			cvs: 'id, updatedAt, sourceId'
		});

		this.cvs.hook('creating', () => {
			setHasCvsHint(true);
			ensurePersistent();
		});

		this.cvs.hook('deleting', (_primKey, _obj, trans) => {
			trans.on('complete', async () => {
				const remaining = await this.cvs.count();
				setHasCvsHint(remaining > 0);
			});
		});
	}
}

export const db = new HumbleHireDB();
