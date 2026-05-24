import type { CV, CVBlocks } from '$lib/types/cv';

/**
 * Strips hidden blocks (by objectId in hiddenBlockIds) and empty blocks before
 * passing data to a theme. Themes receive already-filtered data and never
 * re-implement visibility logic.
 */
export function preprocessBlocks(cv: CV): Partial<CVBlocks> {
	const result: Partial<CVBlocks> = {};
	const hidden = new Set(cv.hiddenBlockIds);
	const b = cv.blocks;

	if (!hidden.has(b.fullName.objectId) && b.fullName.value.trim()) {
		result.fullName = b.fullName;
	}
	if (!hidden.has(b.position.objectId) && b.position.value.trim()) {
		result.position = b.position;
	}
	if (!hidden.has(b.location.objectId) && b.location.value.trim()) {
		result.location = b.location;
	}
	if (!hidden.has(b.contacts.objectId)) {
		const nonEmpty = b.contacts.value.filter((c) => c.label.trim() || c.value.trim());
		if (nonEmpty.length > 0) result.contacts = { ...b.contacts, value: nonEmpty };
	}
	if (!hidden.has(b.highlights.objectId)) {
		const nonEmpty = b.highlights.value.filter((h) => h.text.trim());
		if (nonEmpty.length > 0) result.highlights = { ...b.highlights, value: nonEmpty };
	}
	if (!hidden.has(b.skills.objectId)) {
		const nonEmpty = b.skills.value.filter((cat) => cat.skills.length > 0);
		if (nonEmpty.length > 0) result.skills = { ...b.skills, value: nonEmpty };
	}
	if (!hidden.has(b.jobHistory.objectId) && b.jobHistory.value.length > 0) {
		result.jobHistory = b.jobHistory;
	}
	if (!hidden.has(b.projects.objectId) && b.projects.value.length > 0) {
		result.projects = b.projects;
	}
	if (!hidden.has(b.education.objectId) && b.education.value.length > 0) {
		result.education = b.education;
	}

	return result;
}
