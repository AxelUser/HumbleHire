import { randomUUID } from '$lib/utils.js';

export type ObjectId = string & { readonly __brand: 'ObjectId' };

export function createObjectId(): ObjectId {
	return randomUUID() as ObjectId;
}

export interface WithId {
	objectId: ObjectId;
}

export interface Block<T> extends WithId {
	value: T;
}

export interface Tag extends WithId {
	value: string;
}

export interface ContactEntry extends WithId {
	label: string;
	value: string;
}

export interface JobEntry extends WithId {
	company: string;
	role: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
	current: boolean;
	achievements: Achievement[];
	skills: Tag[];
}

export interface Achievement extends WithId {
	text: string;
}

export interface Highlight extends WithId {
	text: string;
}

export interface ProjectEntry extends WithId {
	name: string;
	description: string;
	stack: Tag[];
	link: string;
}

export interface SkillCategory extends WithId {
	name: string;
	skills: Tag[];
}

export interface EducationEntry extends WithId {
	institution: string;
	degree: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
	current: boolean;
}

export interface CVBlocks {
	fullName: Block<string>;
	position: Block<string>;
	location: Block<string>;

	contacts: Block<ContactEntry[]>;

	highlights: Block<Highlight[]>;

	skills: Block<SkillCategory[]>;

	jobHistory: Block<JobEntry[]>;

	projects: Block<ProjectEntry[]>;

	education: Block<EducationEntry[]>;
}

export type CVBlockKey = keyof CVBlocks;

export type TextBlockKey = {
	[K in keyof CVBlocks]: CVBlocks[K] extends Block<string> ? K : never;
}[keyof CVBlocks];

export type ListBlockKey = {
	[K in keyof CVBlocks]: CVBlocks[K] extends Block<Array<WithId>> ? K : never;
}[keyof CVBlocks];

export type BlockHashes = Record<CVBlockKey, string>;

export interface CV {
	id: string;
	name: string;
	company?: string;
	createdAt: number;
	updatedAt: number;
	blocks: CVBlocks;
	blockHashes: BlockHashes;
	hiddenBlockIds: ObjectId[];

	sourceId?: string;
	syncBaseline?: CVBlocks;
	syncBaselineHashes?: BlockHashes;
}
