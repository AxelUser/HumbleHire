const KEY = 'hh-has-cvs';

export function getHasCvsHint(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(KEY) === 'true';
}

export function setHasCvsHint(value: boolean): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(KEY, value ? 'true' : 'false');
}
