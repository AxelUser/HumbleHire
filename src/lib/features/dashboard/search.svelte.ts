import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type { CV } from '$lib/types/cv';

export type CVHighlights = {
	name?: ReadonlyArray<readonly [number, number]>;
	company?: ReadonlyArray<readonly [number, number]>;
};

export type CVGroup = { master: CV; tailored: CV[] };

type CVIndexEntry = { id: string; name: string; company?: string };

function toCVIndexEntry(cv: CV): CVIndexEntry {
	return { id: cv.id, name: cv.name, company: cv.company };
}

const SEARCH_OPTIONS = {
	keys: ['name', 'company'] as const,
	threshold: 0.3,
	ignoreLocation: true,
	includeMatches: true,
	minMatchCharLength: 2
} satisfies IFuseOptions<CVIndexEntry>;

export function buildAllGroups(cvs: CV[]): CVGroup[] {
	const allIds = new Set(cvs.map((c) => c.id));
	const masters = cvs.filter((c) => !c.sourceId || !allIds.has(c.sourceId));
	return masters.map((master) => ({
		master,
		tailored: cvs
			.filter((c) => c.sourceId === master.id)
			.sort((a, b) => b.createdAt - a.createdAt)
	}));
}

function buildIndex(cvs: CV[]): Fuse<CVIndexEntry> {
	return new Fuse(cvs.map(toCVIndexEntry), SEARCH_OPTIONS);
}

function buildHighlightsMap(
	results: FuseResult<CVIndexEntry>[]
): Map<string, CVHighlights> {
	const map = new Map<string, CVHighlights>();
	for (const result of results) {
		if (!result.matches?.length) continue;
		const h: CVHighlights = {};
		for (const match of result.matches) {
			if (match.key === 'name') h.name = match.indices;
			if (match.key === 'company') h.company = match.indices;
		}
		map.set(result.item.id, h);
	}
	return map;
}

export function runSearch(
	index: Fuse<CVIndexEntry>,
	cvs: CV[],
	query: string
): { filteredGroups: CVGroup[]; highlights: Map<string, CVHighlights>; matchCount: number } {
	const fuseResults = index.search(query);
	const matchedIds = new Set(fuseResults.map((r) => r.item.id));
	const highlights = buildHighlightsMap(fuseResults);

	const filteredGroups = buildAllGroups(cvs)
		.map((group) => {
			if (matchedIds.has(group.master.id)) return group;
			const matchingTailored = group.tailored.filter((c) => matchedIds.has(c.id));
			if (matchingTailored.length > 0) return { master: group.master, tailored: matchingTailored };
			return null;
		})
		.filter((g): g is CVGroup => g !== null);

	return { filteredGroups, highlights, matchCount: matchedIds.size };
}

export class CVSearch {
	query = $state('');

	#rawCvs = $state<CV[]>([]);
	#index = $state<Fuse<CVIndexEntry>>(new Fuse<CVIndexEntry>([], SEARCH_OPTIONS));
	#result = $state<{
		filteredGroups: CVGroup[];
		highlights: Map<string, CVHighlights>;
		matchCount: number;
	} | null>(null);

	constructor(cvs: () => CV[]) {
		$effect(() => {
			const raw = cvs();
			this.#rawCvs = raw;
			this.#index = buildIndex(raw); // use local var — reading this.#rawCvs here would create a self-dependency
		});

		$effect(() => {
			const q = this.query.trim();
			this.#result = q.length >= 2 ? runSearch(this.#index, this.#rawCvs, q) : null;
		});
	}

	get groups(): CVGroup[] {
		return this.#result?.filteredGroups ?? buildAllGroups(this.#rawCvs);
	}

	get highlights(): Map<string, CVHighlights> {
		return this.#result?.highlights ?? new Map();
	}

	get matchCount(): number | null {
		return this.#result?.matchCount ?? null;
	}

	get masterCount(): number {
		return this.groups.length;
	}

	get tailoredCount(): number {
		return this.groups.reduce((n, g) => n + g.tailored.length, 0);
	}
}
