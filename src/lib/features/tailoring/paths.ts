import type { ObjectId } from '$lib/types/cv';

/**
 * The address of a node in CV content. A segment is a field name when stepping into an object and an
 * entry's objectId when stepping into a list. List steps go by id, never position, so a path keeps
 * pointing at the same entry after the list is reordered, and diffs stay order-agnostic.
 */
export type Segment = { field: string } | { id: ObjectId };
export type Path = Segment[];

/**
 * Encode a path to the one canonical string form that both `hidden` addresses and diff decision keys
 * use. Every segment ends in a `/`, which keeps the encoding prefix-safe: the ancestor check below
 * can't mistake `work/` for a sibling like `workshops/`.
 */
export function encodePath(path: Path): string {
	return path.map((seg) => ('field' in seg ? seg.field : seg.id) + '/').join('');
}

/**
 * Tell whether a path is hidden, checking at read time for the path's own address or any ancestor of
 * it in the set. This stays non-destructive: hiding a section shadows the entry-hides beneath it
 * rather than erasing them, so unhiding the section brings each entry back as it was.
 */
export function isPathHidden(hidden: Set<string>, path: Path): boolean {
	const encoded = encodePath(path);
	for (const prefix of hidden) {
		if (encoded.startsWith(prefix)) return true;
	}
	return false;
}
