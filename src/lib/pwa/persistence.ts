import { browser } from '$app/environment';

const PERSISTED_KEY = 'hh-storage-persisted';

export async function ensurePersistent(): Promise<void> {
	if (!browser || !navigator.storage?.persist) return;

	// Already confirmed in a previous session — skip the request
	if (localStorage.getItem(PERSISTED_KEY) === 'true') return;

	const already = await navigator.storage.persisted();
	if (already) {
		localStorage.setItem(PERSISTED_KEY, 'true');
		return;
	}

	const granted = await navigator.storage.persist();
	if (granted) {
		localStorage.setItem(PERSISTED_KEY, 'true');
	}
}

export async function isStoragePersisted(): Promise<boolean> {
	if (!browser || !navigator.storage?.persisted) return false;
	return navigator.storage.persisted();
}
