import { db } from '$lib/db/index';
import type { CV, CVVersion } from '$lib/types/cv';
import { toast } from 'svelte-sonner';

let cv = $state<CV | null>(null);
let saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
let lastSavedAt = $state<number | null>(null);

$effect.root(() => {
	$effect(() => {
		if (!cv) return;
		const timer = setTimeout(async () => {
			saveStatus = 'saving';
			try {
				await db.cvs.put({ ...$state.snapshot(cv!), updatedAt: Date.now() });
				saveStatus = 'saved';
				lastSavedAt = Date.now();
			} catch (err) {
				saveStatus = 'idle';
				toast.error('Auto-save failed. Your changes may not be saved.');
				console.error('Auto-save error:', err);
			}
		}, 1000);
		return () => clearTimeout(timer);
	});
});

export function getCV() {
	return cv;
}

export function setCV(value: CV | null) {
	cv = value;
}

export function getSaveStatus() {
	return saveStatus;
}

export function getLastSavedAt() {
	return lastSavedAt;
}

export async function saveVersion(name: string, notes?: string): Promise<void> {
	if (!cv) return;
	const version: CVVersion = {
		id: crypto.randomUUID(),
		cvId: cv.id,
		name,
		notes,
		createdAt: Date.now(),
		snapshot: $state.snapshot(cv.blocks)
	};
	await db.versions.add(version);
	toast.success(`Version "${name}" saved.`);
}
