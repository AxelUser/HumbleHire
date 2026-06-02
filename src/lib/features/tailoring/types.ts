import type {
	CVBlockKey,
	TextBlockKey,
	ListBlockKey,
	ObjectId,
	Achievement,
	Highlight,
	Tag,
	ContactEntry,
	JobEntry,
	ProjectEntry,
	SkillCategory,
	EducationEntry
} from '$lib/types/cv';

export type AnyEntry =
	| JobEntry
	| ProjectEntry
	| ContactEntry
	| SkillCategory
	| EducationEntry
	| Achievement
	| Highlight
	| Tag;

export type NestedListKey = 'achievements' | 'skills' | 'stack';

export type DiffChange = 'added' | 'removed' | 'modified';

export interface TextDiffItem {
	kind: 'text';
	blockKey: TextBlockKey;
	objectId: ObjectId;
	before: string;
	after: string;
}

export type EntryDiffItem =
	| {
			kind: 'entry';
			change: 'added' | 'removed';
			blockKey: ListBlockKey;
			objectId: ObjectId;
	  }
	| {
			kind: 'entry';
			change: 'modified';
			blockKey: ListBlockKey;
			objectId: ObjectId;
			before: Record<string, unknown>;
			after: Record<string, unknown>;
	  };

export type NestedDiffItem =
	| {
			kind: 'nested';
			change: 'added' | 'removed';
			blockKey: ListBlockKey;
			nestedListKey: NestedListKey;
			parentObjectId: ObjectId;
			objectId: ObjectId;
	  }
	| {
			kind: 'nested';
			change: 'modified';
			blockKey: ListBlockKey;
			nestedListKey: NestedListKey;
			parentObjectId: ObjectId;
			objectId: ObjectId;
			before: Record<string, unknown>;
			after: Record<string, unknown>;
	  };

export type DiffItem = TextDiffItem | EntryDiffItem | NestedDiffItem;

export const BLOCK_LABELS: Partial<Record<CVBlockKey, string>> = {
	fullName: 'Full Name',
	position: 'Position',
	location: 'Location',
	contacts: 'Contacts',
	highlights: 'Highlights',
	skills: 'Skills',
	jobHistory: 'Job History',
	projects: 'Projects',
	education: 'Education'
};

export const FIELD_LABELS: Record<string, string> = {
	company: 'Company',
	role: 'Role',
	startDate: 'Start date',
	endDate: 'End date',
	name: 'Name',
	description: 'Description',
	link: 'Link',
	label: 'Label',
	value: 'Value',
	institution: 'Institution',
	degree: 'Degree',
	text: 'Text'
};
