import { getContext, setContext } from 'svelte';
import { db } from '$lib/db/index';
import type { CV, CVBlocks, CVVersion } from '$lib/types/cv';
import { toast } from 'svelte-sonner';

const CV_STORE_KEY = Symbol('cv-store');

export class CVStore {
	cv = $state<CV | null>(null);
	saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	lastSavedAt = $state<number | null>(null);

	constructor() {
		$effect(() => {
			if (!this.cv) return;
			/* 
			Snapshot establishes deep reactive dependencies on all
			nested cv properties for the effect to re-run whenever any field changes.
			Don't remove it unless you know what you're doing.
			*/
			const snapshot = $state.snapshot(this.cv);

			const timer = setTimeout(async () => {
				this.saveStatus = 'saving';
				try {
					await db.cvs.put({ ...snapshot, updatedAt: Date.now() });
					this.saveStatus = 'saved';
					this.lastSavedAt = Date.now();
				} catch (err) {
					this.saveStatus = 'idle';
					toast.error('Auto-save failed. Your changes may not be saved.');
					console.error('Auto-save error:', err);
				}
			}, 1000);
			return () => clearTimeout(timer);
		});
	}

	async saveVersion(name: string, notes?: string): Promise<void> {
		if (!this.cv) return;
		const version: CVVersion = {
			id: crypto.randomUUID(),
			cvId: this.cv.id,
			name,
			notes,
			createdAt: Date.now(),
			snapshot: $state.snapshot(this.cv.blocks) as CVBlocks
		};
		await db.versions.add(version);
		toast.success(`Version "${name}" saved.`);
	}
}

export function setCVStoreContext(store: CVStore): void {
	setContext(CV_STORE_KEY, store);
}

export function getCVStoreContext(): CVStore {
	return getContext<CVStore>(CV_STORE_KEY);
}
