import type {
	CVBlockKey,
	JobEntry,
	ProjectEntry,
	ContactEntry,
	SkillCategory,
	EducationEntry,
	Achievement,
	Highlight,
	Tag,
	CV
} from '$lib/types/cv';
import type { AnyEntry, DiffItem, NestedListKey } from './types';
import { BLOCK_LABELS, FIELD_LABELS } from './types';
import { resolveParentEntry, resolveDiffEntry } from './locate';

const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

export function formatValue(value: unknown): string {
	if (value instanceof Date) return monthYear.format(value);
	if (value === undefined || value === null || value === '') return '(empty)';
	return String(value);
}

export function formatPeriod(start?: Date, end?: Date): string | undefined {
	if (!start && !end) return undefined;
	const from = start ? monthYear.format(start) : '?';
	const to = end ? monthYear.format(end) : 'Present';
	return `${from} – ${to}`;
}

export function joinParts(...parts: Array<string | undefined>): string | undefined {
	const kept = parts.filter((p): p is string => !!p && p.length > 0);
	return kept.length > 0 ? kept.join(' · ') : undefined;
}

export type EntryKind =
	| 'job'
	| 'project'
	| 'contact'
	| 'skillCategory'
	| 'education'
	| 'achievement'
	| 'highlight'
	| 'tag';

export function entryKind(blockKey: CVBlockKey, nestedListKey?: NestedListKey): EntryKind {
	if (nestedListKey === 'achievements') return 'achievement';
	if (nestedListKey === 'skills' || nestedListKey === 'stack') return 'tag';
	switch (blockKey) {
		case 'jobHistory':
			return 'job';
		case 'projects':
			return 'project';
		case 'contacts':
			return 'contact';
		case 'skills':
			return 'skillCategory';
		case 'education':
			return 'education';
		case 'highlights':
			return 'highlight';
		default:
			return 'tag';
	}
}

export const ENTRY_NOUNS: Record<EntryKind, string> = {
	job: 'job entry',
	project: 'project',
	contact: 'contact',
	skillCategory: 'skill category',
	education: 'education entry',
	achievement: 'achievement',
	highlight: 'highlight',
	tag: 'skill'
};

export function entryTitle(kind: EntryKind, entry: AnyEntry): string {
	switch (kind) {
		case 'job':
			return (entry as JobEntry).company || '(untitled)';
		case 'project':
			return (entry as ProjectEntry).name || '(untitled)';
		case 'contact':
			return (entry as ContactEntry).value || '(empty)';
		case 'skillCategory':
			return (entry as SkillCategory).name || '(untitled)';
		case 'education':
			return (entry as EducationEntry).institution || '(untitled)';
		case 'achievement':
			return (entry as Achievement).text || '(empty)';
		case 'highlight':
			return (entry as Highlight).text || '(empty)';
		case 'tag':
			return (entry as Tag).value || '(empty)';
	}
}

export interface DiffRowMeta {
	blockLabel: string;
	title: string;
	description: string;
	change: 'added' | 'removed' | 'modified';
}

export function describeDiff(item: DiffItem, masterCv: CV, tailoredCv: CV): DiffRowMeta {
	const blockLabel = BLOCK_LABELS[item.blockKey] ?? String(item.blockKey);

	if (item.kind === 'text') {
		return {
			blockLabel,
			title: blockLabel,
			description: `Changed ${blockLabel}`,
			change: 'modified'
		};
	}

	if (item.kind === 'nested') {
		const kind = entryKind(item.blockKey, item.nestedListKey);
		const noun = ENTRY_NOUNS[kind];
		const verb =
			item.change === 'added' ? 'Added' : item.change === 'removed' ? 'Removed' : 'Modified';
		const parent = resolveParentEntry(item, masterCv, tailoredCv);
		const parentKind = entryKind(item.blockKey);
		const title = parent ? entryTitle(parentKind, parent) : '(unknown)';
		return { blockLabel, title, description: `${verb} ${noun}`, change: item.change };
	}

	// top-level entry
	const kind = entryKind(item.blockKey);
	const noun = ENTRY_NOUNS[kind];
	const entry = resolveDiffEntry(item, masterCv, tailoredCv);
	const title = entry ? entryTitle(kind, entry) : '(unknown)';
	const verb =
		item.change === 'added' ? 'Added' : item.change === 'removed' ? 'Removed' : 'Modified';
	const description = item.change === 'modified' ? `Modified ${noun}` : `${verb} ${noun}`;
	return { blockLabel, title, description, change: item.change };
}

export { BLOCK_LABELS, FIELD_LABELS };
