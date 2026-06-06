import type { ThemeModule, TDocumentDefinitions } from '../../types';
import type { CVContent, WorkEntry, ProjectEntry, EducationEntry } from '$lib/types/cv';
import { formatDateRange, trimUrl, formatSkillCategory } from './format';

// A4: 595.28pt × 841.89pt. Margins: 15mm L/R (~42.5pt), 20mm T/B (~56.7pt)
const PAGE_MARGINS: [number, number, number, number] = [42.5, 56.7, 42.5, 56.7];
const CONTENT_WIDTH = 595.28 - 42.5 * 2; // ~510pt

function hairline() {
	return { canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 0.4 }] };
}

function sectionHeading(title: string) {
	return {
		stack: [
			{
				text: title.toUpperCase(),
				style: 'sectionHeading',
				margin: [0, 10, 0, 2]
			},
			hairline()
		]
	};
}

function inlineText(main: string, bold: boolean, suffix?: string) {
	if (!suffix) return { text: main, bold };
	return {
		text: [
			{ text: main, bold },
			{ text: suffix, bold: false }
		]
	};
}

function entryHeader(left: object, dateRange?: string) {
	if (!dateRange) return left;
	return {
		columns: [
			{ width: '*', ...left },
			{ width: 'auto', text: dateRange, style: 'dateRange', alignment: 'right' }
		],
		columnGap: 8
	};
}

function renderJob(job: WorkEntry) {
	const dateRange = formatDateRange(job.startDate, job.endDate, job.current);
	const label = inlineText(job.name, true, job.position ? ` · ${job.position}` : undefined);
	const items: object[] = [{ ...entryHeader(label, dateRange), margin: [0, 0, 0, 0] }];

	const highlights = job.highlights.map((h) => h.value).filter(Boolean);
	if (highlights.length > 0) {
		items.push({ ul: highlights, style: 'body', margin: [0, 3, 0, 0] });
	}
	const keywords = job.keywords.map((k) => k.value).filter(Boolean);
	if (keywords.length > 0) {
		items.push({ text: keywords.join(', '), style: 'tagLine', margin: [0, 3, 0, 0] });
	}
	return { stack: items };
}

function renderProject(project: ProjectEntry) {
	const nameEl = project.url
		? { text: project.name, link: project.url, style: 'link' }
		: { text: project.name, bold: true };
	const urlEl = project.url ? { text: ` — ${trimUrl(project.url)}`, style: 'urlText' } : null;

	const items: object[] = [{ text: [nameEl, ...(urlEl ? [urlEl] : [])], margin: [0, 0, 0, 0] }];
	if (project.description.trim()) {
		items.push({ text: project.description, style: 'body', margin: [0, 2, 0, 0] });
	}
	const keywords = project.keywords.map((k) => k.value).filter(Boolean);
	if (keywords.length > 0) {
		items.push({ text: keywords.join(', '), style: 'tagLine', margin: [0, 2, 0, 0] });
	}
	return { stack: items };
}

function renderEducation(edu: EducationEntry) {
	const dateRange = formatDateRange(edu.startDate, edu.endDate, edu.current);
	const degree = [edu.studyType, edu.area].filter(Boolean).join(' ');
	const label = inlineText(edu.institution, true, degree ? ` · ${degree}` : undefined);
	return { stack: [{ ...entryHeader(label, dateRange) }] };
}

function sectionEntries<T>(
	heading: object,
	entries: T[],
	renderFn: (entry: T) => object
): object[] {
	if (entries.length === 0) return [];
	const [first, ...rest] = entries;
	const result: object[] = [
		{ stack: [heading, { ...renderFn(first), margin: [0, 6, 0, 0] }], pageBreak: 'avoid' }
	];
	for (const entry of rest) {
		result.push({ stack: [renderFn(entry)], pageBreak: 'avoid', margin: [0, 6, 0, 0] });
	}
	return result;
}

export const classicTheme: ThemeModule = {
	name: 'Classic',

	build(cv: CVContent): TDocumentDefinitions {
		const content: object[] = [];
		const b = cv.basics;

		// Header
		if (b.fullName.trim()) {
			content.push({ text: b.fullName, style: 'name', margin: [0, 0, 0, 2] });
		}
		if (b.position.trim()) {
			content.push({ text: b.position, style: 'position', margin: [0, 0, 0, 4] });
		}

		// Contacts row: location first, then the typed contact fields and profiles
		const contactParts: string[] = [];
		if (b.location.trim()) contactParts.push(b.location);
		if (b.email.trim()) contactParts.push(b.email);
		if (b.phone.trim()) contactParts.push(b.phone);
		if (b.url.trim()) contactParts.push(b.url);
		for (const p of b.profiles) {
			const value = p.url || p.username || '';
			if (value.trim()) contactParts.push(p.network.trim() ? `${p.network}: ${value}` : value);
		}
		if (contactParts.length > 0) {
			content.push({ text: contactParts.join(' | '), style: 'contacts', margin: [0, 0, 0, 12] });
		}

		// Summary (Highlights)
		const highlights = b.highlights.map((h) => h.value).filter(Boolean);
		if (highlights.length > 0) {
			content.push({
				stack: [sectionHeading('Summary'), { ul: highlights, style: 'body', margin: [0, 6, 0, 0] }],
				margin: [0, 0, 0, 4]
			});
		}

		// Skills
		const skillLines = cv.skills
			.filter((cat) => cat.keywords.length > 0)
			.map((cat) =>
				formatSkillCategory(
					cat.name,
					cat.keywords.map((k) => k.value)
				)
			);
		if (skillLines.length > 0) {
			content.push({
				stack: [
					sectionHeading('Skills'),
					{ text: skillLines.join('\n'), style: 'body', margin: [0, 6, 0, 0] }
				],
				margin: [0, 0, 0, 4]
			});
		}

		// Experience
		if (cv.work.length > 0) {
			content.push(...sectionEntries(sectionHeading('Experience'), cv.work, renderJob));
		}

		// Projects
		if (cv.projects.length > 0) {
			content.push(...sectionEntries(sectionHeading('Projects'), cv.projects, renderProject));
		}

		// Education
		if (cv.education.length > 0) {
			content.push(...sectionEntries(sectionHeading('Education'), cv.education, renderEducation));
		}

		// pdfmake's content DSL uses plain objects; cast content to satisfy the interface contract
		return {
			content: content as unknown as TDocumentDefinitions['content'],
			pageSize: 'A4',
			pageMargins: PAGE_MARGINS,
			defaultStyle: {
				font: 'Roboto',
				fontSize: 10,
				lineHeight: 1.4
			},
			styles: {
				name: { fontSize: 22, bold: true },
				position: { fontSize: 12, color: '#555555' },
				contacts: { fontSize: 9, color: '#666666' },
				sectionHeading: { fontSize: 9, bold: true, characterSpacing: 0.5 },
				entryTitle: { bold: true, fontSize: 10 },
				dateRange: { fontSize: 9, color: '#666666' },
				body: { fontSize: 10 },
				tagLine: { fontSize: 9, color: '#777777', italics: true },
				link: { bold: true, decoration: 'underline' },
				urlText: { fontSize: 9, color: '#666666' }
			}
		};
	}
};
