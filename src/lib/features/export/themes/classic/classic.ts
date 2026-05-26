import type { ThemeModule, TDocumentDefinitions } from '../../types';
import type { CVBlocks, JobEntry, ProjectEntry, EducationEntry } from '$lib/types/cv';
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

function renderJob(job: JobEntry) {
	const dateRange = formatDateRange(job.startDate, job.endDate, job.current);
	const label = inlineText(job.company, true, job.role ? ` · ${job.role}` : undefined);
	const items: object[] = [{ ...entryHeader(label, dateRange), margin: [0, 0, 0, 0] }];

	if (job.achievements.length > 0) {
		items.push({
			ul: job.achievements.map((a) => a.text).filter(Boolean),
			style: 'body',
			margin: [0, 3, 0, 0]
		});
	}
	if (job.skills.length > 0) {
		items.push({
			text: job.skills.map((s) => s.value).join(', '),
			style: 'tagLine',
			margin: [0, 3, 0, 0]
		});
	}
	return { stack: items };
}

function renderProject(project: ProjectEntry) {
	const nameEl = project.link
		? { text: project.name, link: project.link, style: 'link' }
		: { text: project.name, bold: true };
	const urlEl = project.link ? { text: ` — ${trimUrl(project.link)}`, style: 'urlText' } : null;

	const items: object[] = [{ text: [nameEl, ...(urlEl ? [urlEl] : [])], margin: [0, 0, 0, 0] }];
	if (project.description.trim()) {
		items.push({ text: project.description, style: 'body', margin: [0, 2, 0, 0] });
	}
	if (project.stack.length > 0) {
		items.push({
			text: project.stack.map((s) => s.value).join(', '),
			style: 'tagLine',
			margin: [0, 2, 0, 0]
		});
	}
	return { stack: items };
}

function renderEducation(edu: EducationEntry) {
	const dateRange = formatDateRange(edu.startDate, edu.endDate, edu.current);
	const label = inlineText(edu.institution, true, edu.degree ? ` · ${edu.degree}` : undefined);
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

	build(blocks: Partial<CVBlocks>): TDocumentDefinitions {
		const content: object[] = [];

		// Header
		if (blocks.fullName) {
			content.push({ text: blocks.fullName.value, style: 'name', margin: [0, 0, 0, 2] });
		}
		if (blocks.position) {
			content.push({ text: blocks.position.value, style: 'position', margin: [0, 0, 0, 4] });
		}

		// Contacts row: location first, then label: value pairs
		const contactParts: string[] = [];
		if (blocks.location) contactParts.push(blocks.location.value);
		if (blocks.contacts) {
			for (const c of blocks.contacts.value) {
				const part = c.label.trim() ? `${c.label}: ${c.value}` : c.value;
				if (part.trim()) contactParts.push(part);
			}
		}
		if (contactParts.length > 0) {
			content.push({ text: contactParts.join(' | '), style: 'contacts', margin: [0, 0, 0, 12] });
		}

		// Summary (Highlights)
		if (blocks.highlights && blocks.highlights.value.length > 0) {
			content.push({
				stack: [
					sectionHeading('Summary'),
					{
						ul: blocks.highlights.value.map((h) => h.text).filter(Boolean),
						style: 'body',
						margin: [0, 6, 0, 0]
					}
				],
				margin: [0, 0, 0, 4]
			});
		}

		// Skills
		if (blocks.skills && blocks.skills.value.length > 0) {
			const lines = blocks.skills.value
				.filter((cat) => cat.skills.length > 0)
				.map((cat) =>
					formatSkillCategory(
						cat.name,
						cat.skills.map((s) => s.value)
					)
				);
			if (lines.length > 0) {
				content.push({
					stack: [
						sectionHeading('Skills'),
						{ text: lines.join('\n'), style: 'body', margin: [0, 6, 0, 0] }
					],
					margin: [0, 0, 0, 4]
				});
			}
		}

		// Experience
		if (blocks.jobHistory && blocks.jobHistory.value.length > 0) {
			content.push(
				...sectionEntries(sectionHeading('Experience'), blocks.jobHistory.value, renderJob)
			);
		}

		// Projects
		if (blocks.projects && blocks.projects.value.length > 0) {
			content.push(
				...sectionEntries(sectionHeading('Projects'), blocks.projects.value, renderProject)
			);
		}

		// Education
		if (blocks.education && blocks.education.value.length > 0) {
			content.push(
				...sectionEntries(sectionHeading('Education'), blocks.education.value, renderEducation)
			);
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
