export interface CVTemplateBlock {
	label: string;
	blockKey: string;
	kind: 'text' | 'array';
}

export interface CVTemplate {
	name: string;
	blocks: CVTemplateBlock[];
}

export const CLASSIC_TEMPLATE: CVTemplate = {
	name: 'Classic',
	blocks: [
		{ label: 'Full Name', blockKey: 'fullName', kind: 'text' },
		{ label: 'Position', blockKey: 'position', kind: 'text' },
		{ label: 'Location', blockKey: 'location', kind: 'text' },
		{ label: 'Contacts', blockKey: 'contacts', kind: 'array' },
		{ label: 'Highlights', blockKey: 'highlights', kind: 'array' },
		{ label: 'Skills', blockKey: 'skills', kind: 'array' },
		{ label: 'Job History', blockKey: 'jobHistory', kind: 'array' },
		{ label: 'Projects', blockKey: 'projects', kind: 'array' },
		{ label: 'Education', blockKey: 'education', kind: 'array' }
	]
};
