import { toast } from 'svelte-sonner';

/**
 * Surfaces the app-update prompt when the service worker has a fresh build ready.
 * Copy stays in the app sense of "update" per CONTEXT.md: a new version, not sync.
 */
export function notifyUpdate(onReload: () => void): void {
	toast('A new version of HumbleHire is available', {
		duration: Infinity,
		action: {
			label: 'Reload',
			onClick: onReload
		},
		cancel: { label: 'Later', onClick: () => {} }
	});
}
