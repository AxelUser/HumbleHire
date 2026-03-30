import type {
	CVBlockKey,
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

export interface IDiffBuilder {
	textModified(blockKey: CVBlockKey, objectId: ObjectId, before: string, after: string): void;

	entryAdded(blockKey: CVBlockKey, entry: AnyEntry, parentObjectId?: ObjectId): void;

	entryRemoved(blockKey: CVBlockKey, entry: AnyEntry, parentObjectId?: ObjectId): void;

	entryModified(
		blockKey: CVBlockKey,
		objectId: ObjectId,
		before: Record<string, unknown>,
		after: Record<string, unknown>,
		parentObjectId?: ObjectId
	): void;

	childrenReordered(
		blockKey: CVBlockKey,
		objectId: ObjectId,
		beforeIds: ObjectId[],
		afterIds: ObjectId[],
		parentObjectId?: ObjectId
	): void;
}

export type DiffItemType =
	| 'textModified'
	| 'entryAdded'
	| 'entryRemoved'
	| 'entryModified'
	| 'childrenReordered';

export type DiffItem =
	| {
			type: 'textModified';
			blockKey: CVBlockKey;
			objectId: ObjectId;
			before: string;
			after: string;
	  }
	| {
			type: 'entryAdded';
			blockKey: CVBlockKey;
			objectId: ObjectId;
			parentObjectId?: ObjectId;
			entry: AnyEntry;
	  }
	| {
			type: 'entryRemoved';
			blockKey: CVBlockKey;
			objectId: ObjectId;
			parentObjectId?: ObjectId;
			entry: AnyEntry;
	  }
	| {
			type: 'entryModified';
			blockKey: CVBlockKey;
			objectId: ObjectId;
			parentObjectId?: ObjectId;
			before: Record<string, unknown>;
			after: Record<string, unknown>;
	  }
	| {
			type: 'childrenReordered';
			blockKey: CVBlockKey;
			objectId: ObjectId;
			parentObjectId?: ObjectId;
			beforeIds: ObjectId[];
			afterIds: ObjectId[];
	  };

export interface DiffViewItem {
	objectId: ObjectId;
	type: DiffItemType;
	blockKey: CVBlockKey;
	blockLabel: string;
	description: string;
	before?: string;
	after?: string;
	parentObjectId?: ObjectId;
	previouslyDiscarded?: boolean;
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
