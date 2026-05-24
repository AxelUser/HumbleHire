const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

/**
 * Formats a date range as "Month Year – Month Year" or "Month Year – Present".
 */
export function formatDateRange(start?: Date, end?: Date): string | undefined {
	if (!start) return undefined;
	const from = monthYear.format(start);
	const to = end ? monthYear.format(end) : 'Present';
	return `${from} – ${to}`;
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
