/**
 * The static schema that defines the sync tree: one tree of NodeDescriptors mirroring
 * CVContent, each carrying its kind and display labels and NO values. The single source
 * of every label and breadcrumb in the sync view, and the future i18n seam. See ADR-011.
 *
 * Adding a section later is a declarative edit here plus a typed array on CVContent — the
 * descriptor-coverage test fails if a content field ever lacks a node.
 */

export type ScalarType = 'text' | 'date' | 'bool';

export interface ScalarDescriptor {
	kind: 'scalar';
	label: string;
	type: ScalarType;
}

export interface ObjectDescriptor {
	kind: 'object';
	label: string;
	fields: Record<string, NodeDescriptor>;
}

export interface ListDescriptor {
	kind: 'list';
	label: string; // names the list/section
	itemLabel: string; // singular noun for an added/removed entry ("Job", "Skill")
	itemValueLabel?: string; // field whose value titles a specific entry; falls back to first non-empty scalar
	entry: ObjectDescriptor;
}

export type NodeDescriptor = ScalarDescriptor | ObjectDescriptor | ListDescriptor;

function scalar(label: string, type: ScalarType = 'text'): ScalarDescriptor {
	return { kind: 'scalar', label, type };
}

function object(label: string, fields: Record<string, NodeDescriptor>): ObjectDescriptor {
	return { kind: 'object', label, fields };
}

function list(
	label: string,
	itemLabel: string,
	entry: ObjectDescriptor,
	itemValueLabel?: string
): ListDescriptor {
	return { kind: 'list', label, itemLabel, itemValueLabel, entry };
}

/** A list of id-bearing StringEntry items that serialize to string[]. */
function stringList(label: string, itemLabel: string): ListDescriptor {
	return list(label, itemLabel, object(itemLabel, { value: scalar(itemLabel) }), 'value');
}

const BASICS = object('Basics', {
	fullName: scalar('Full Name'),
	position: scalar('Position'),
	image: scalar('Photo'),
	location: scalar('Location'),
	summary: scalar('Summary'),
	highlights: stringList('Highlights', 'Highlight'),
	email: scalar('Email'),
	phone: scalar('Phone'),
	url: scalar('Website'),
	profiles: list(
		'Profiles',
		'Profile',
		object('Profile', {
			network: scalar('Network'),
			username: scalar('Username'),
			url: scalar('URL')
		}),
		'network'
	)
});

const WORK = list(
	'Work',
	'Job',
	object('Job', {
		name: scalar('Employer'),
		position: scalar('Position'),
		location: scalar('Location'),
		description: scalar('Description'),
		url: scalar('Website'),
		startDate: scalar('Start date', 'date'),
		endDate: scalar('End date', 'date'),
		current: scalar('Current', 'bool'),
		summary: scalar('Summary'),
		highlights: stringList('Highlights', 'Highlight'),
		keywords: stringList('Keywords', 'Keyword')
	}),
	'name'
);

const VOLUNTEER = list(
	'Volunteer',
	'Volunteer entry',
	object('Volunteer entry', {
		organization: scalar('Organization'),
		position: scalar('Position'),
		url: scalar('Website'),
		startDate: scalar('Start date', 'date'),
		endDate: scalar('End date', 'date'),
		current: scalar('Current', 'bool'),
		summary: scalar('Summary'),
		highlights: stringList('Highlights', 'Highlight')
	}),
	'organization'
);

const EDUCATION = list(
	'Education',
	'Education entry',
	object('Education entry', {
		institution: scalar('Institution'),
		url: scalar('Website'),
		studyType: scalar('Study type'),
		area: scalar('Area'),
		startDate: scalar('Start date', 'date'),
		endDate: scalar('End date', 'date'),
		current: scalar('Current', 'bool'),
		score: scalar('Score'),
		courses: stringList('Courses', 'Course')
	}),
	'institution'
);

const AWARDS = list(
	'Awards',
	'Award',
	object('Award', {
		title: scalar('Title'),
		date: scalar('Date', 'date'),
		awarder: scalar('Awarder'),
		summary: scalar('Summary')
	}),
	'title'
);

const CERTIFICATES = list(
	'Certificates',
	'Certificate',
	object('Certificate', {
		name: scalar('Name'),
		date: scalar('Date', 'date'),
		url: scalar('Website'),
		issuer: scalar('Issuer')
	}),
	'name'
);

const PUBLICATIONS = list(
	'Publications',
	'Publication',
	object('Publication', {
		name: scalar('Name'),
		publisher: scalar('Publisher'),
		releaseDate: scalar('Release date', 'date'),
		url: scalar('Website'),
		summary: scalar('Summary')
	}),
	'name'
);

const SKILLS = list(
	'Skills',
	'Skill category',
	object('Skill category', {
		name: scalar('Name'),
		level: scalar('Level'),
		keywords: stringList('Keywords', 'Skill')
	}),
	'name'
);

const LANGUAGES = list(
	'Languages',
	'Language',
	object('Language', {
		language: scalar('Language'),
		fluency: scalar('Fluency')
	}),
	'language'
);

const INTERESTS = list(
	'Interests',
	'Interest',
	object('Interest', {
		name: scalar('Name'),
		keywords: stringList('Keywords', 'Keyword')
	}),
	'name'
);

const REFERENCES = list(
	'References',
	'Reference',
	object('Reference', {
		name: scalar('Name'),
		reference: scalar('Reference')
	}),
	'name'
);

const PROJECTS = list(
	'Projects',
	'Project',
	object('Project', {
		name: scalar('Name'),
		description: scalar('Description'),
		url: scalar('Website'),
		startDate: scalar('Start date', 'date'),
		endDate: scalar('End date', 'date'),
		current: scalar('Current', 'bool'),
		highlights: stringList('Highlights', 'Highlight'),
		keywords: stringList('Keywords', 'Keyword'),
		roles: stringList('Roles', 'Role'),
		entity: scalar('Entity'),
		type: scalar('Type')
	}),
	'name'
);

export const CV_DESCRIPTOR: ObjectDescriptor = object('CV', {
	basics: BASICS,
	work: WORK,
	volunteer: VOLUNTEER,
	education: EDUCATION,
	awards: AWARDS,
	certificates: CERTIFICATES,
	publications: PUBLICATIONS,
	skills: SKILLS,
	languages: LANGUAGES,
	interests: INTERESTS,
	references: REFERENCES,
	projects: PROJECTS
});
