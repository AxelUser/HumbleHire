import posthog from 'posthog-js';
import { dev } from '$app/environment';
import * as env from '$env/static/public';

export function initAnalytics(): void {
	if (dev) return;
	if (import.meta.env.VITE_E2E) return;
	if (
		!('PUBLIC_POSTHOG_API_KEY' in env) ||
		!('PUBLIC_POSTHOG_HOST' in env) ||
		typeof env.PUBLIC_POSTHOG_API_KEY !== 'string' ||
		typeof env.PUBLIC_POSTHOG_HOST !== 'string'
	) {
		return;
	}

	posthog.init(env.PUBLIC_POSTHOG_API_KEY, {
		api_host: env.PUBLIC_POSTHOG_HOST,
		persistence: 'localStorage',
		autocapture: false,
		disable_session_recording: true,
		person_profiles: 'identified_only',
		capture_pageview: true,
		capture_pageleave: true
	});
}

export function capture(event: string, properties?: Record<string, unknown>): void {
	if (typeof window === 'undefined') return;
	try {
		posthog.capture(event, properties);
	} catch {
		// analytics errors must never break the app
	}
}
