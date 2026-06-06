import type { CV, CVContent } from '$lib/types/cv';

/**
 * Test whether an editor block's hide marker is covered by the CV's hidden set, using the same
 * prefix rule the sync engine uses (every marker ends in `/`).
 */
function markerHidden(hidden: Set<string>, marker: string): boolean {
	for (const prefix of hidden) {
		if (marker.startsWith(prefix)) return true;
	}
	return false;
}

/**
 * Filter a CV's content for rendering: blank out whatever the editor has hidden, so themes receive
 * already-filtered data and never reimplement visibility. Basics sub-fields hide by their field path;
 * the list sections hide by their section path. `basics/contacts/` is a synthetic group marker for
 * the email/phone/url/profiles row — not a real content path, so the sync engine never emits it; it
 * only drives editor and preview visibility.
 */
export function preprocessContent(cv: CV): CVContent {
	const hidden = new Set(cv.hidden);
	const content = structuredClone(cv.content);
	const b = content.basics;

	if (markerHidden(hidden, 'basics/fullName/')) b.fullName = '';
	if (markerHidden(hidden, 'basics/position/')) b.position = '';
	if (markerHidden(hidden, 'basics/location/')) b.location = '';
	if (markerHidden(hidden, 'basics/highlights/')) b.highlights = [];
	if (markerHidden(hidden, 'basics/contacts/')) {
		b.email = '';
		b.phone = '';
		b.url = '';
		b.profiles = [];
	}
	if (markerHidden(hidden, 'skills/')) content.skills = [];
	if (markerHidden(hidden, 'work/')) content.work = [];
	if (markerHidden(hidden, 'projects/')) content.projects = [];
	if (markerHidden(hidden, 'education/')) content.education = [];

	return content;
}
