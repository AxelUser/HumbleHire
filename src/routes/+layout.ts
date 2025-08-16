import posthog from 'posthog-js';
import { browser } from '$app/environment';
import * as env from '$env/static/public';
import { dev } from '$app/environment';

export const prerender = true;

export const load = async () => {
	if (browser && !dev && env.PUBLIC_POSTHOG_API_KEY && env.PUBLIC_POSTHOG_HOST) {
		posthog.init(env.PUBLIC_POSTHOG_API_KEY, {
			api_host: env.PUBLIC_POSTHOG_HOST,
			defaults: '2025-05-24',
			person_profiles: 'always'
		});
	}

	return;
};
