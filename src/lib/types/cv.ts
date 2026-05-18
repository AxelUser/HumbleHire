export type ObjectId = string & { readonly __brand: 'ObjectId' };

export function createObjectId(): ObjectId {
	return crypto.randomUUID() as ObjectId;
}

export interface TextBlock {
	objectId: ObjectId;
	value: string;
}

export interface Achievement {
	objectId: ObjectId;
	text: string;
}

export interface Highlight {
	objectId: ObjectId;
	text: string;
}

export interface Tag {
	objectId: ObjectId;
	value: string;
}

export interface ContactEntry {
	objectId: ObjectId;
	label: string;
	value: string;
}

export interface JobEntry {
	objectId: ObjectId;
	company: string;
	role: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
	achievements: Achievement[];
	skills: Tag[];
}

export interface ProjectEntry {
	objectId: ObjectId;
	name: string;
	description: string;
	stack: Tag[];
	link: string;
}

export interface SkillCategory {
	objectId: ObjectId;
	name: string;
	skills: Tag[];
}

export interface EducationEntry {
	objectId: ObjectId;
	institution: string;
	degree: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
}

export interface SyncDecisions {
	sourceSyncedVersion: number;
	discarded: Record<string, number>;
}

export interface CVBlocks {
	fullName: TextBlock;
	position: TextBlock;
	location: TextBlock;

	contactsBlockId: ObjectId;
	contacts: ContactEntry[];

	highlightsBlockId: ObjectId;
	highlights: Highlight[];

	skillsBlockId: ObjectId;
	skills: SkillCategory[];

	jobHistoryBlockId: ObjectId;
	jobHistory: JobEntry[];

	projectsBlockId: ObjectId;
	projects: ProjectEntry[];

	educationBlockId: ObjectId;
	education: EducationEntry[];
}

export type CVBlockKey = keyof CVBlocks;

export type TextBlockKey = {
	[K in keyof CVBlocks]: CVBlocks[K] extends TextBlock ? K : never;
}[keyof CVBlocks];

export type ListBlockKey = {
	[K in keyof CVBlocks]: CVBlocks[K] extends Array<{ objectId: ObjectId }> ? K : never;
}[keyof CVBlocks];

export interface CV {
	id: string;
	name: string;
	notes: string;
	createdAt: number;
	updatedAt: number;
	version: number;
	blocks: CVBlocks;
	hiddenBlockIds: ObjectId[];

	sourceId?: string;
	syncDecisions?: SyncDecisions;
	syncBaseline?: CVBlocks;
}
