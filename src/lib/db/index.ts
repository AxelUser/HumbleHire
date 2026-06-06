import Dexie, { type Table } from 'dexie';
import type { CV } from '$lib/types/cv';
import { setHasCvsHint } from '$lib/services/cv/has-cvs-hint';
import { ensurePersistent } from '$lib/pwa/persistence';

class HumbleHireDB extends Dexie {
	cvs!: Table<CV>;

	constructor() {
		super('humblehire');
		// v1 stored the old presentation-coupled `blocks` model. The v0.1.0 content model (ADR-010)
		// is incompatible, so the store is dropped and recreated empty rather than migrated — a
		// deliberate one-time wipe, justified by pre-launch status and not a pattern to repeat.
		this.version(1).stores({ cvs: 'id, updatedAt, sourceId' });
		this.version(2).stores({ cvs: null });
		this.version(3).stores({ cvs: 'id, updatedAt, sourceId' });

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
