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

export type DiffItemType = 'textModified' | 'entryAdded' | 'entryRemoved' | 'entryModified';

export type DiffItem =
	| {
			type: 'textModified';
			blockKey: TextBlockKey;
			objectId: ObjectId;
			before: string;
			after: string;
	  }
	| {
			type: 'entryAdded';
			blockKey: ListBlockKey;
			objectId: ObjectId;
			parentObjectId?: ObjectId;
			nestedListKey?: NestedListKey;
			entry: AnyEntry;
	  }
	| {
			type: 'entryRemoved';
			blockKey: ListBlockKey;
			objectId: ObjectId;
			parentObjectId?: ObjectId;
			nestedListKey?: NestedListKey;
			entry: AnyEntry;
	  }
	| {
			type: 'entryModified';
			blockKey: ListBlockKey;
			objectId: ObjectId;
			parentObjectId?: ObjectId;
			nestedListKey?: NestedListKey;
			entry: AnyEntry;
			before: Record<string, unknown>;
			after: Record<string, unknown>;
	  };

export interface FieldChange {
	label: string;
	before: string;
	after: string;
}

export interface EntryPreview {
	title: string;
	subtitle?: string;
	bullets?: string[];
	tags?: string[];
}

export interface DiffViewItem {
	objectId: ObjectId;
	type: DiffItemType;
	blockKey: CVBlockKey;
	blockLabel: string;
	description: string;
	parentObjectId?: ObjectId;
	previouslyDiscarded?: boolean;
	preview?: EntryPreview;
	fields?: FieldChange[];
}

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
