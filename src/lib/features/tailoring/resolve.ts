import type { CVContent, WithId } from '$lib/types/cv';
import {
	CV_DESCRIPTOR,
	type ListDescriptor,
	type NodeDescriptor,
	type ObjectDescriptor,
	type ScalarDescriptor
} from './descriptor';
import type { Path, Segment } from './paths';

export type Scalar = string | number | boolean | Date | undefined;

/**
 * What a path points at, tagged so callers narrow it instead of casting. `missing` means the walk
 * fell off the content — a field the descriptor doesn't list, or an id no entry carries.
 */
export type Resolved =
	| { kind: 'scalar'; value: Scalar }
	| { kind: 'object'; value: Record<string, unknown> }
	| { kind: 'list'; value: WithId[] }
	| { kind: 'missing' };

export interface ScalarNode {
	kind: 'scalar';
	path: Path;
	descriptor: ScalarDescriptor;
	value: Scalar;
}
export interface ObjectNode {
	kind: 'object';
	path: Path;
	descriptor: ObjectDescriptor;
	fields: Record<string, SyncNode>;
}
export interface ListNode {
	kind: 'list';
	path: Path;
	descriptor: ListDescriptor;
	/** Each item's path ends in its own id segment, so list order never matters. */
	items: ObjectNode[];
}
export type SyncNode = ScalarNode | ObjectNode | ListNode;

/**
 * Follow a path into content and report what sits at the end. Walks the descriptor and the content
 * together: a field segment steps into an object property, an id segment steps into a list by
 * matching `objectId` (never by index), so the same path keeps working after a list is reordered.
 * Handles any depth. Returns a tagged {@link Resolved} the caller discriminates; the only cast is
 * confined to {@link step}.
 */
export function resolve(content: CVContent, path: Path): Resolved {
	let node: NodeDescriptor = CV_DESCRIPTOR;
	let value: unknown = content;
	for (const seg of path) {
		const next = step(seg, node, value);
		if (!next) return { kind: 'missing' };
		node = next.node;
		value = next.value;
	}
	return tag(node, value);
}

/**
 * Take one segment of a path: descend from a descriptor node and its value to the child node and
 * child value. Returns undefined when the segment doesn't fit the node (a field on a list, an id on
 * an object, an unknown field, or an id no entry has), which is how {@link resolve} reports a miss.
 */
function step(
	seg: Segment,
	node: NodeDescriptor,
	value: unknown
): { node: NodeDescriptor; value: unknown } | undefined {
	if ('field' in seg) {
		if (node.kind !== 'object') return undefined;
		const child = node.fields[seg.field];
		if (!child) return undefined;
		return { node: child, value: (value as Record<string, unknown> | undefined)?.[seg.field] };
	}
	if (node.kind !== 'list') return undefined;
	const entry = (value as WithId[] | undefined)?.find((e) => e.objectId === seg.id);
	if (!entry) return undefined;
	return { node: node.entry, value: entry };
}

/** Tag a resolved value by its descriptor kind so the caller gets a discriminated result. */
function tag(node: NodeDescriptor, value: unknown): Resolved {
	switch (node.kind) {
		case 'scalar':
			return { kind: 'scalar', value: value as Scalar };
		case 'object':
			return { kind: 'object', value: (value ?? {}) as Record<string, unknown> };
		case 'list':
			return { kind: 'list', value: (value ?? []) as WithId[] };
	}
}

/** Project content into the generic sync tree by walking the descriptor and content in lockstep. */
export function project(content: CVContent): ObjectNode {
	return buildObject(content as unknown as Record<string, unknown>, CV_DESCRIPTOR, []);
}

function buildNode(value: unknown, descriptor: NodeDescriptor, path: Path): SyncNode {
	switch (descriptor.kind) {
		case 'scalar':
			return { kind: 'scalar', path, descriptor, value: value as Scalar };
		case 'object':
			return buildObject((value ?? {}) as Record<string, unknown>, descriptor, path);
		case 'list':
			return buildList((value ?? []) as WithId[], descriptor, path);
	}
}

function buildObject(
	value: Record<string, unknown>,
	descriptor: ObjectDescriptor,
	path: Path
): ObjectNode {
	const fields: Record<string, SyncNode> = {};
	for (const [key, child] of Object.entries(descriptor.fields)) {
		fields[key] = buildNode(value[key], child, [...path, { field: key }]);
	}
	return { kind: 'object', path, descriptor, fields };
}

function buildList(value: WithId[], descriptor: ListDescriptor, path: Path): ListNode {
	const items = value.map((entry) =>
		buildObject(entry as unknown as Record<string, unknown>, descriptor.entry, [
			...path,
			{ id: entry.objectId }
		])
	);
	return { kind: 'list', path, descriptor, items };
}
