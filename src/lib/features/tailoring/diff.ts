import type {
	CV,
	CVBlockKey,
	ObjectId,
	TextBlock,
	Highlight,
	ContactEntry,
	SkillCategory,
	Tag,
	JobEntry,
	Achievement,
	ProjectEntry,
	EducationEntry
} from '$lib/types/cv';
import type { IDiffBuilder, DiffItem, AnyEntry } from './types';

export class CollectingDiffBuilder implements IDiffBuilder {
	readonly items: DiffItem[] = [];

	textModified(blockKey: CVBlockKey, objectId: ObjectId, before: string, after: string): void {
		this.items.push({ type: 'textModified', blockKey, objectId, before, after });
	}

	entryAdded(blockKey: CVBlockKey, entry: { objectId: ObjectId }, parentObjectId?: ObjectId): void {
		this.items.push({ type: 'entryAdded', blockKey, objectId: entry.objectId, parentObjectId, entry: entry as AnyEntry });
	}

	entryRemoved(blockKey: CVBlockKey, entry: { objectId: ObjectId }, parentObjectId?: ObjectId): void {
		this.items.push({ type: 'entryRemoved', blockKey, objectId: entry.objectId, parentObjectId, entry: entry as AnyEntry });
	}

	entryModified(
		blockKey: CVBlockKey,
		objectId: ObjectId,
		before: Record<string, unknown>,
		after: Record<string, unknown>,
		parentObjectId?: ObjectId
	): void {
		this.items.push({ type: 'entryModified', blockKey, objectId, before, after, parentObjectId });
	}

	childrenReordered(
		blockKey: CVBlockKey,
		objectId: ObjectId,
		beforeIds: ObjectId[],
		afterIds: ObjectId[],
		parentObjectId?: ObjectId
	): void {
		this.items.push({ type: 'childrenReordered', blockKey, objectId, beforeIds, afterIds, parentObjectId });
	}
}

function diffTextBlock(
	key: CVBlockKey,
	master: TextBlock,
	tailored: TextBlock,
	builder: IDiffBuilder
): void {
	if (master.value !== tailored.value) {
		builder.textModified(key, master.objectId, tailored.value, master.value);
	}
}

function diffHighlights(
	master: Highlight[],
	tailored: Highlight[],
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tailored.map((h) => [h.objectId, h]));
	const masterIds = master.map((h) => h.objectId);
	const tailoredIds = tailored.map((h) => h.objectId);

	for (const h of master) {
		const t = tailoredMap.get(h.objectId);
		if (!t) {
			builder.entryAdded('highlights', h);
		} else if (h.text !== t.text) {
			builder.entryModified('highlights', h.objectId, { text: t.text }, { text: h.text });
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			'highlights',
			('highlights:order') as ObjectId,
			commonTailored,
			commonMaster
		);
	}
}

function diffContacts(
	master: ContactEntry[],
	tailored: ContactEntry[],
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tailored.map((c) => [c.objectId, c]));
	const masterIds = master.map((c) => c.objectId);
	const tailoredIds = tailored.map((c) => c.objectId);

	for (const m of master) {
		const t = tailoredMap.get(m.objectId);
		if (!t) {
			builder.entryAdded('contacts', m);
		} else if (m.label !== t.label || m.value !== t.value) {
			builder.entryModified(
				'contacts',
				m.objectId,
				{ label: t.label, value: t.value },
				{ label: m.label, value: m.value }
			);
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			'contacts',
			('contacts:order') as ObjectId,
			commonTailored,
			commonMaster
		);
	}
}

function diffTags(
	tags_master: Tag[],
	tags_tailored: Tag[],
	blockKey: CVBlockKey,
	parentObjectId: ObjectId,
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tags_tailored.map((t) => [t.objectId, t]));
	const masterIds = tags_master.map((t) => t.objectId);
	const tailoredIds = tags_tailored.map((t) => t.objectId);

	for (const m of tags_master) {
		const t = tailoredMap.get(m.objectId);
		if (!t) {
			builder.entryAdded(blockKey, m, parentObjectId);
		} else if (m.value !== t.value) {
			builder.entryModified(blockKey, m.objectId, { value: t.value }, { value: m.value }, parentObjectId);
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			blockKey,
			(parentObjectId + ':tags:order') as ObjectId,
			commonTailored,
			commonMaster,
			parentObjectId
		);
	}
}

function diffAchievements(
	master: Achievement[],
	tailored: Achievement[],
	parentObjectId: ObjectId,
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tailored.map((a) => [a.objectId, a]));
	const masterIds = master.map((a) => a.objectId);
	const tailoredIds = tailored.map((a) => a.objectId);

	for (const m of master) {
		const t = tailoredMap.get(m.objectId);
		if (!t) {
			builder.entryAdded('jobHistory', m, parentObjectId);
		} else if (m.text !== t.text) {
			builder.entryModified(
				'jobHistory',
				m.objectId,
				{ text: t.text },
				{ text: m.text },
				parentObjectId
			);
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			'jobHistory',
			(parentObjectId + ':achievements:order') as ObjectId,
			commonTailored,
			commonMaster,
			parentObjectId
		);
	}
}

function diffSkills(
	master: SkillCategory[],
	tailored: SkillCategory[],
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tailored.map((c) => [c.objectId, c]));
	const masterIds = master.map((c) => c.objectId);
	const tailoredIds = tailored.map((c) => c.objectId);

	for (const m of master) {
		const t = tailoredMap.get(m.objectId);
		if (!t) {
			builder.entryAdded('skills', m);
		} else {
			if (m.name !== t.name) {
				builder.entryModified(
					'skills',
					m.objectId,
					{ name: t.name },
					{ name: m.name }
				);
			}
			diffTags(m.skills, t.skills, 'skills', m.objectId, builder);
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			'skills',
			('skills:order') as ObjectId,
			commonTailored,
			commonMaster
		);
	}
}

function diffJobHistory(
	master: JobEntry[],
	tailored: JobEntry[],
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tailored.map((j) => [j.objectId, j]));
	const masterIds = master.map((j) => j.objectId);
	const tailoredIds = tailored.map((j) => j.objectId);

	for (const m of master) {
		const t = tailoredMap.get(m.objectId);
		if (!t) {
			builder.entryAdded('jobHistory', m);
		} else {
			const scalarBefore: Record<string, unknown> = {};
			const scalarAfter: Record<string, unknown> = {};
			if (m.company !== t.company) { scalarBefore.company = t.company; scalarAfter.company = m.company; }
			if (m.role !== t.role) { scalarBefore.role = t.role; scalarAfter.role = m.role; }
			if (String(m.startDate) !== String(t.startDate)) { scalarBefore.startDate = t.startDate; scalarAfter.startDate = m.startDate; }
			if (String(m.endDate) !== String(t.endDate)) { scalarBefore.endDate = t.endDate; scalarAfter.endDate = m.endDate; }
			if (Object.keys(scalarAfter).length > 0) {
				builder.entryModified('jobHistory', m.objectId, scalarBefore, scalarAfter);
			}
			diffAchievements(m.achievements, t.achievements, m.objectId, builder);
			diffTags(m.skills, t.skills, 'jobHistory', m.objectId, builder);
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			'jobHistory',
			('jobHistory:order') as ObjectId,
			commonTailored,
			commonMaster
		);
	}
}

function diffProjects(
	master: ProjectEntry[],
	tailored: ProjectEntry[],
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tailored.map((p) => [p.objectId, p]));
	const masterIds = master.map((p) => p.objectId);
	const tailoredIds = tailored.map((p) => p.objectId);

	for (const m of master) {
		const t = tailoredMap.get(m.objectId);
		if (!t) {
			builder.entryAdded('projects', m);
		} else {
			const scalarBefore: Record<string, unknown> = {};
			const scalarAfter: Record<string, unknown> = {};
			if (m.name !== t.name) { scalarBefore.name = t.name; scalarAfter.name = m.name; }
			if (m.description !== t.description) { scalarBefore.description = t.description; scalarAfter.description = m.description; }
			if (m.link !== t.link) { scalarBefore.link = t.link; scalarAfter.link = m.link; }
			if (Object.keys(scalarAfter).length > 0) {
				builder.entryModified('projects', m.objectId, scalarBefore, scalarAfter);
			}
			diffTags(m.stack, t.stack, 'projects', m.objectId, builder);
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			'projects',
			('projects:order') as ObjectId,
			commonTailored,
			commonMaster
		);
	}
}

function diffEducation(
	master: EducationEntry[],
	tailored: EducationEntry[],
	builder: IDiffBuilder
): void {
	const tailoredMap = new Map(tailored.map((e) => [e.objectId, e]));
	const masterIds = master.map((e) => e.objectId);
	const tailoredIds = tailored.map((e) => e.objectId);

	for (const m of master) {
		const t = tailoredMap.get(m.objectId);
		if (!t) {
			builder.entryAdded('education', m);
		} else {
			const scalarBefore: Record<string, unknown> = {};
			const scalarAfter: Record<string, unknown> = {};
			if (m.institution !== t.institution) { scalarBefore.institution = t.institution; scalarAfter.institution = m.institution; }
			if (m.degree !== t.degree) { scalarBefore.degree = t.degree; scalarAfter.degree = m.degree; }
			if (String(m.startDate) !== String(t.startDate)) { scalarBefore.startDate = t.startDate; scalarAfter.startDate = m.startDate; }
			if (String(m.endDate) !== String(t.endDate)) { scalarBefore.endDate = t.endDate; scalarAfter.endDate = m.endDate; }
			if (Object.keys(scalarAfter).length > 0) {
				builder.entryModified('education', m.objectId, scalarBefore, scalarAfter);
			}
		}
	}

	const masterIdSet = new Set(masterIds);
	const commonTailored = tailoredIds.filter((id) => masterIdSet.has(id));
	const commonMaster = masterIds.filter((id) => tailoredMap.has(id));
	if (
		commonMaster.length === commonTailored.length &&
		commonMaster.some((id, i) => id !== commonTailored[i])
	) {
		builder.childrenReordered(
			'education',
			('education:order') as ObjectId,
			commonTailored,
			commonMaster
		);
	}
}

export function diffCVs(master: CV, tailored: CV, builder: IDiffBuilder): void {
	const hidden = new Set(master.hiddenBlockIds);

	if (!hidden.has(master.blocks.fullName.objectId)) {
		diffTextBlock('fullName', master.blocks.fullName, tailored.blocks.fullName, builder);
	}
	if (!hidden.has(master.blocks.position.objectId)) {
		diffTextBlock('position', master.blocks.position, tailored.blocks.position, builder);
	}
	if (!hidden.has(master.blocks.location.objectId)) {
		diffTextBlock('location', master.blocks.location, tailored.blocks.location, builder);
	}

	if (!hidden.has(master.blocks.contactsBlockId)) {
		diffContacts(master.blocks.contacts, tailored.blocks.contacts, builder);
	}
	if (!hidden.has(master.blocks.highlightsBlockId)) {
		diffHighlights(master.blocks.highlights, tailored.blocks.highlights, builder);
	}
	if (!hidden.has(master.blocks.skillsBlockId)) {
		diffSkills(master.blocks.skills, tailored.blocks.skills, builder);
	}
	if (!hidden.has(master.blocks.jobHistoryBlockId)) {
		diffJobHistory(master.blocks.jobHistory, tailored.blocks.jobHistory, builder);
	}
	if (!hidden.has(master.blocks.projectsBlockId)) {
		diffProjects(master.blocks.projects, tailored.blocks.projects, builder);
	}
	if (!hidden.has(master.blocks.educationBlockId)) {
		diffEducation(master.blocks.education, tailored.blocks.education, builder);
	}
}
