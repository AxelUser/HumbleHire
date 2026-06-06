import type { CV, CVContent, ObjectId, WithId } from '$lib/types/cv';
import { diffCVs } from './diff';
import { computeHashes } from './hash';
import { encodePath, type Path } from './paths';
import { resolve, type Scalar } from './resolve';
import type { DiffItem } from './types';

type Decision = 'accepted' | 'discarded';

/**
 * Reconcile a tailored copy with its master, one decided diff item at a time.
 *
 * The baseline is the durable memory of decisions, so both accept and discard move it to the
 * master's value at that path and a decided change won't be raised again. Accept also writes the
 * change into the tailored content; discard leaves the tailored content alone. An item with no
 * decision is skipped and its baseline stays put — which is why a hidden section, whose changes
 * never become items, keeps surfacing them honestly once it's unhidden.
 *
 * Mutates `tailored` in place and refreshes both hash caches.
 */
export function applySyncDecisions(
	tailored: CV,
	master: CV,
	decisions: Map<string, Decision>
): void {
	const items = diffCVs(master, tailored);
	const baseline = (tailored.baseline ??= structuredClone(master.content));

	for (const item of items) {
		const decision = decisions.get(encodePath(item.path));
		if (!decision) continue;
		applyItem(item, decision === 'accepted', tailored.content, master.content, baseline);
	}

	tailored.hashes = computeHashes(tailored.content);
	tailored.baselineHashes = computeHashes(baseline);
}

/** Advance the baseline for one item, and the tailored content too when the item was accepted. */
function applyItem(
	item: DiffItem,
	accepted: boolean,
	tailored: CVContent,
	master: CVContent,
	baseline: CVContent
): void {
	switch (item.change) {
		case 'modified':
			setScalar(baseline, item.path, item.after);
			if (accepted) setScalar(tailored, item.path, item.after);
			break;
		case 'added': {
			const found = resolve(master, item.path);
			if (found.kind !== 'object') break;
			const entry = found.value as unknown as WithId;
			addEntry(baseline, item.path, entry);
			if (accepted) addEntry(tailored, item.path, entry);
			break;
		}
		case 'removed':
			removeEntry(baseline, item.path);
			if (accepted) removeEntry(tailored, item.path);
			break;
	}
}

/** The id at the tail of an entry path (an added/removed item always ends at one). */
function lastId(path: Path): ObjectId {
	const seg = path[path.length - 1];
	return 'id' in seg ? seg.id : ('' as ObjectId);
}

/** The list that holds the entry a path addresses, i.e. whatever the path's parent resolves to. */
function parentList(content: CVContent, path: Path): WithId[] | undefined {
	const parent = resolve(content, path.slice(0, -1));
	return parent.kind === 'list' ? parent.value : undefined;
}

/** Write a scalar at a path by setting the named field on the object the parent resolves to. */
function setScalar(content: CVContent, path: Path, value: Scalar): void {
	const parent = resolve(content, path.slice(0, -1));
	const seg = path[path.length - 1];
	if (parent.kind === 'object' && 'field' in seg) parent.value[seg.field] = value;
}

/** Copy an entry from the master into the target list, unless that list already has its id. */
function addEntry(content: CVContent, path: Path, source: WithId): void {
	const list = parentList(content, path);
	if (!list || list.some((e) => e.objectId === source.objectId)) return;
	list.push(structuredClone(source));
}

/** Drop the entry the path addresses from its list. */
function removeEntry(content: CVContent, path: Path): void {
	const list = parentList(content, path);
	if (!list) return;
	const oid = lastId(path);
	const idx = list.findIndex((e) => e.objectId === oid);
	if (idx >= 0) list.splice(idx, 1);
}
