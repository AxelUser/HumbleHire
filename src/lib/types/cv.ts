export interface CV {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	blocks: CVBlocks;
	blockVisibility: Record<CVBlockKey, boolean>;
}

export interface CVBlocks {
	fullName: string;
	position: string;
	location: string;
	contacts: ContactEntry[];
	highlights: string[];
	jobHistory: JobEntry[];
	projects: ProjectEntry[];
	education: EducationEntry[];
}

export type CVBlockKey = keyof CVBlocks;

export interface ContactEntry {
	id: string;
	label: string;
	value: string;
}

export interface JobEntry {
	id: string;
	company: string;
	role: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
	achievements: string[];
}

export interface ProjectEntry {
	id: string;
	name: string;
	description: string;
	stack: string;
	link: string;
}

export interface EducationEntry {
	id: string;
	institution: string;
	degree: string;
	startDate: Date | undefined;
	endDate: Date | undefined;
}

export function createEmptyCV(id: string, name: string): CV {
	return {
		id,
		name,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		blocks: {
			fullName: '',
			position: '',
			location: '',
			contacts: [],
			highlights: [],
			jobHistory: [],
			projects: [],
			education: []
		},
		blockVisibility: {
			fullName: true,
			position: true,
			location: true,
			contacts: true,
			highlights: true,
			jobHistory: true,
			projects: true,
			education: true
		}
	};
}
