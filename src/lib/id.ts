import { nanoid as secureNanoid } from 'nanoid';
import { nanoid as insecureNanoid } from 'nanoid/non-secure';

export function createId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
		return secureNanoid();
	}
	return insecureNanoid();
}
