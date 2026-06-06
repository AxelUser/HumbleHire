import type { CV } from '$lib/types/cv';
import { CV_DESCRIPTOR, type ListDescriptor, type NodeDescriptor } from './descriptor';
import type { DiffItem } from './types';

const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

/** Render a value for display: a Date as "Mon YYYY", an empty value as a placeholder, else as text. */
export function formatValue(value: unknown): string {
	if (value instanceof Date) return monthYear.format(value);
	if (value === undefined || value === null || value === '') return '(empty)';
	return String(value);
}

/** Render a start–end period, collapsing to a single date or "Present", or nothing when undated. */
export function formatPeriod(start?: Date, end?: Date, current = false): string | undefined {
	if (!start && !end && !current) return undefined;
	const from = start ? monthYear.format(start) : '?';
	if (current) return `${from} – Present`;
	if (!end) return from;
	return `${from} – ${monthYear.format(end)}`;
}

/** Join the non-empty parts with a middot, or return nothing when they're all empty. */
export function joinParts(...parts: Array<string | undefined>): string | undefined {
	const kept = parts.filter((p): p is string => !!p && p.length > 0);
	return kept.length > 0 ? kept.join(' · ') : undefined;
}

/** Titles a specific list entry: its value-label field, else the first non-empty scalar, else a placeholder. */
export function entryTitle(
	list: ListDescriptor,
	entry: Record<string, unknown> | undefined
): string {
	if (!entry) return '(unknown)';
	if (list.itemValueLabel) {
		const v = entry[list.itemValueLabel];
		if (typeof v === 'string' && v.trim()) return v;
	}
	for (const [key, node] of Object.entries(list.entry.fields)) {
		if (node.kind !== 'scalar') continue;
		const v = entry[key];
		if (typeof v === 'string' && v.trim()) return v;
	}
	return '(untitled)';
}

export interface DiffRowMeta {
	breadcrumb: string[];
	description: string;
	change: DiffItem['change'];
}

/** Narrow a value to a plain record, or undefined when it isn't one, so the walk can read fields off it. */
function asRecord(value: unknown): Record<string, unknown> | undefined {
	return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

/** Find an entry by id in what should be a list, returning undefined when it isn't there. */
function findById(value: unknown, id: string): Record<string, unknown> | undefined {
	if (!Array.isArray(value)) return undefined;
	return value.find((e) => (e as { objectId?: string }).objectId === id) as
		| Record<string, unknown>
		| undefined;
}

/**
 * Build a readable breadcrumb and a one-line description for a diff item, reading every word from
 * the descriptor along the item's path: section and list labels, an entry title from the list's
 * itemValueLabel, and the field label at the end. No hard-coded label maps, which is what leaves
 * room for translation later. Entry titles come from the master, falling back to the tailored copy
 * for a removed entry that's already gone from the master.
 */
export function describeDiff(item: DiffItem, master: CV, tailored: CV): DiffRowMeta {
	const breadcrumb: string[] = [];
	let node: NodeDescriptor = CV_DESCRIPTOR;
	let valM: unknown = master.content;
	let valT: unknown = tailored.content;
	let lastListLabel = '';
	let lastScalarLabel = '';

	for (const seg of item.path) {
		if ('field' in seg) {
			if (node.kind !== 'object') break;
			const child: NodeDescriptor | undefined = node.fields[seg.field];
			if (!child) break;
			breadcrumb.push(child.label);
			if (child.kind === 'scalar') lastScalarLabel = child.label;
			node = child;
			valM = asRecord(valM)?.[seg.field];
			valT = asRecord(valT)?.[seg.field];
		} else {
			if (node.kind !== 'list') break;
			lastListLabel = node.itemLabel;
			const entryM = findById(valM, seg.id);
			const entryT = findById(valT, seg.id);
			breadcrumb.push(entryTitle(node, entryM ?? entryT));
			node = node.entry;
			valM = entryM;
			valT = entryT;
		}
	}

	const description =
		item.change === 'modified'
			? `Changed ${lastScalarLabel}`
			: item.change === 'added'
				? `Added ${lastListLabel}`
				: `Removed ${lastListLabel}`;

	return { breadcrumb, description, change: item.change };
}
