const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

/**
 * Formats a date range. "Present" only when `current` is explicitly true —
 * an absent end date with `current=false` collapses to just the start.
 */
export function formatDateRange(start?: Date, end?: Date, current = false): string | undefined {
	if (!start) return undefined;
	const from = monthYear.format(start);
	if (current) return `${from} – Present`;
	if (end) return `${from} – ${monthYear.format(end)}`;
	return from;
}

/** Strips protocol and www, removes trailing slash. e.g. github.com/user/repo */
export function trimUrl(url: string): string {
	if (!url.trim()) return url;
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.replace(/^www\./, '');
		const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
		return host + pathname;
	} catch {
		return url;
	}
}

/** Named category: "Frontend: React, TypeScript". Empty name: flat "React, TypeScript". */
export function formatSkillCategory(name: string, skills: string[]): string {
	const list = skills.join(', ');
	return name.trim() ? `${name}: ${list}` : list;
}
