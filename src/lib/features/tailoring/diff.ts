import type { CV, ObjectId } from '$lib/types/cv';
import type { DiffItem } from './types';
import { isPathHidden } from './paths';
import {
	project,
	type ListNode,
	type ObjectNode,
	type Scalar,
	type ScalarNode,
	type SyncNode
} from './resolve';

/**
 * Diff a master against one of its tailored copies and return the changes worth showing.
 *
 * The comparison is three-way: the baseline (the master's content captured at the last sync), the
 * master's content now, and the tailored copy's own edits. That third side is what lets it ignore a
 * change the tailored copy already made for itself, and surface only what the master moved. Items
 * are per-field and path-addressed, lists match by id rather than position, and sections hidden on
 * either side drop out. Recurses to any depth.
 */
export function diffCVs(master: CV, tailored: CV): DiffItem[] {
	const baseline = project(tailored.baseline ?? master.content);
	const masterTree = project(master.content);
	const tailoredTree = project(tailored.content);
	const masterHidden = new Set(master.hidden);
	const tailoredHidden = new Set(tailored.hidden);

	const items: DiffItem[] = [];
	const ctx = { items, masterHidden, tailoredHidden };
	diffObject(baseline, masterTree, tailoredTree, ctx);
	return items;
}

interface Ctx {
	items: DiffItem[];
	masterHidden: Set<string>;
	tailoredHidden: Set<string>;
}

/** A node drops out of the diff if either the master or the tailored copy hides its path. */
function hiddenEitherSide(ctx: Ctx, node: SyncNode): boolean {
	return isPathHidden(ctx.masterHidden, node.path) || isPathHidden(ctx.tailoredHidden, node.path);
}

/** Walk an object's fields, comparing each child across the three sides and skipping hidden ones. */
function diffObject(
	baseline: ObjectNode | undefined,
	master: ObjectNode,
	tailored: ObjectNode,
	ctx: Ctx
): void {
	for (const key of Object.keys(master.fields)) {
		const m = master.fields[key];
		const t = tailored.fields[key];
		const b = baseline?.fields[key];
		if (!t || hiddenEitherSide(ctx, m)) continue;
		diffNode(b, m, t, ctx);
	}
}

function diffNode(
	baseline: SyncNode | undefined,
	master: SyncNode,
	tailored: SyncNode,
	ctx: Ctx
): void {
	switch (master.kind) {
		case 'scalar':
			diffScalar(baseline as ScalarNode | undefined, master, tailored as ScalarNode, ctx);
			break;
		case 'object':
			diffObject(baseline as ObjectNode | undefined, master, tailored as ObjectNode, ctx);
			break;
		case 'list':
			diffList(baseline as ListNode | undefined, master, tailored as ListNode, ctx);
			break;
	}
}

/** Compare two scalars, treating Dates by their string form so equal dates count as equal. */
function sameValue(a: Scalar, b: Scalar): boolean {
	if (a instanceof Date || b instanceof Date) return String(a) === String(b);
	return a === b;
}

/** Raise a `modified` item when the master moved a scalar that the tailored copy hasn't matched. */
function diffScalar(
	baseline: ScalarNode | undefined,
	master: ScalarNode,
	tailored: ScalarNode,
	ctx: Ctx
): void {
	if (sameValue(baseline?.value, master.value)) return; // master unchanged since baseline
	if (sameValue(tailored.value, master.value)) return; // tailored already equals master
	ctx.items.push({
		change: 'modified',
		path: master.path,
		before: tailored.value,
		after: master.value
	});
}

/** A list item's own id, which is the last segment of its path. */
function nodeId(node: ObjectNode): ObjectId {
	const seg = node.path[node.path.length - 1];
	return 'id' in seg ? seg.id : ('' as ObjectId);
}

/** Index list items by id so the three sides can be matched without caring about order. */
function byId(nodes: ObjectNode[]): Map<ObjectId, ObjectNode> {
	return new Map(nodes.map((n) => [nodeId(n), n]));
}

/** Match a list's items by id across the three sides: removals, additions, then changed fields. */
function diffList(
	baseline: ListNode | undefined,
	master: ListNode,
	tailored: ListNode,
	ctx: Ctx
): void {
	const baselineMap = byId(baseline?.items ?? []);
	const masterMap = byId(master.items);
	const tailoredMap = byId(tailored.items);

	// In baseline but not master: master removed it, surface if tailored still has it.
	for (const baseItem of baseline?.items ?? []) {
		const oid = nodeId(baseItem);
		if (!masterMap.has(oid) && tailoredMap.has(oid) && !hiddenEitherSide(ctx, baseItem)) {
			ctx.items.push({ change: 'removed', path: baseItem.path });
		}
	}

	for (const masterItem of master.items) {
		if (hiddenEitherSide(ctx, masterItem)) continue;
		const oid = nodeId(masterItem);
		const baseItem = baselineMap.get(oid);
		const tailoredItem = tailoredMap.get(oid);

		if (!baseItem) {
			// Not in baseline: master added it. Surface only if tailored doesn't already have it.
			if (!tailoredItem) ctx.items.push({ change: 'added', path: masterItem.path });
			continue;
		}
		// Present in both baseline and master: diff fields if tailored kept it.
		if (tailoredItem) diffObject(baseItem, masterItem, tailoredItem, ctx);
		// tailoredItem absent: user removed it from tailored, leave it alone.
	}
}
