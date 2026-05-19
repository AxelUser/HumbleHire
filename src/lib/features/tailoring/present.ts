import type {
	CVBlockKey,
	JobEntry,
	ProjectEntry,
	ContactEntry,
	SkillCategory,
	EducationEntry,
	Achievement,
	Highlight,
	Tag
} from '$lib/types/cv';
import type { AnyEntry, DiffItem, DiffViewItem, EntryPreview, NestedListKey } from './types';
import { BLOCK_LABELS, FIELD_LABELS } from './types';

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

type EntryKind =
	| 'job'
	| 'project'
	| 'contact'
	| 'skillCategory'
	| 'education'
	| 'achievement'
	| 'highlight'
	| 'tag';

function entryKind(blockKey: CVBlockKey, nestedListKey?: NestedListKey): EntryKind {
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

const ENTRY_NOUNS: Record<EntryKind, string> = {
	job: 'job entry',
	project: 'project',
	contact: 'contact',
	skillCategory: 'skill category',
	education: 'education entry',
	achievement: 'achievement',
	highlight: 'highlight',
	tag: 'skill'
};

function joinParts(...parts: Array<string | undefined>): string | undefined {
	const kept = parts.filter((p): p is string => !!p && p.length > 0);
	return kept.length > 0 ? kept.join(' · ') : undefined;
}

export function entryPreview(
	blockKey: CVBlockKey,
	nestedListKey: NestedListKey | undefined,
	entry: AnyEntry
): EntryPreview {
	switch (entryKind(blockKey, nestedListKey)) {
		case 'job': {
			const e = entry as JobEntry;
			return {
				title: e.company || '(untitled)',
				subtitle: joinParts(e.role, formatPeriod(e.startDate, e.endDate)),
				bullets: e.achievements.map((a) => a.text),
				tags: e.skills.map((s) => s.value)
			};
		}
		case 'project': {
			const e = entry as ProjectEntry;
			return {
				title: e.name || '(untitled)',
				subtitle: e.link || undefined,
				bullets: e.description ? [e.description] : undefined,
				tags: e.stack.map((s) => s.value)
			};
		}
		case 'contact': {
			const e = entry as ContactEntry;
			return { title: e.value || '(empty)', subtitle: e.label || undefined };
		}
		case 'skillCategory': {
			const e = entry as SkillCategory;
			return { title: e.name || '(untitled)', tags: e.skills.map((s) => s.value) };
		}
		case 'education': {
			const e = entry as EducationEntry;
			return {
				title: e.institution || '(untitled)',
				subtitle: joinParts(e.degree, formatPeriod(e.startDate, e.endDate))
			};
		}
		case 'achievement':
			return { title: (entry as Achievement).text || '(empty)' };
		case 'highlight':
			return { title: (entry as Highlight).text || '(empty)' };
		case 'tag':
			return { title: (entry as Tag).value || '(empty)' };
	}
}

export function toViewItem(
	item: DiffItem,
	existingDiscarded: Record<string, number>
): DiffViewItem {
	const blockLabel = BLOCK_LABELS[item.blockKey] ?? String(item.blockKey);
	const previouslyDiscarded = existingDiscarded[item.objectId] !== undefined;
	const base = {
		objectId: item.objectId,
		type: item.type,
		blockKey: item.blockKey,
		blockLabel,
		previouslyDiscarded
	};

	switch (item.type) {
		case 'textModified':
			return {
				...base,
				description: `Changed ${blockLabel}`,
				fields: [{ label: blockLabel, before: item.before || '(empty)', after: item.after || '(empty)' }]
			};
		case 'entryAdded':
		case 'entryRemoved': {
			const noun = ENTRY_NOUNS[entryKind(item.blockKey, item.nestedListKey)];
			const preview = entryPreview(item.blockKey, item.nestedListKey, item.entry);
			const verb = item.type === 'entryAdded' ? 'Added' : 'Removed';
			return {
				...base,
				parentObjectId: item.parentObjectId,
				description: `${verb} ${noun} — ${preview.title}`,
				preview
			};
		}
		case 'entryModified': {
			const preview = entryPreview(item.blockKey, item.nestedListKey, item.entry);
			const fields = Object.keys(item.after).map((key) => ({
				label: FIELD_LABELS[key] ?? key,
				before: formatValue(item.before[key]),
				after: formatValue(item.after[key])
			}));
			return {
				...base,
				parentObjectId: item.parentObjectId,
				description: `Changed ${preview.title}`,
				fields
			};
		}
	}
}
