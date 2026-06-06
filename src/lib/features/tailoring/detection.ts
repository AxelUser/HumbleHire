import type { CV } from '$lib/types/cv';
import { SECTION_KEYS } from './hash';
import { isPathHidden } from './paths';

/**
 * Decide whether the updates-available badge should light. Compares the master's per-section hashes
 * against the tailored copy's baseline hashes and skips any section hidden on either side. This is
 * the cheap check the dashboard runs without rehydrating full content.
 *
 * One accepted false positive lives here. The check works per section, but the sync drawer honours
 * per-field hiding. So if the only master change is in a basics field the user hid (say
 * `basics/location/`), the basics section itself isn't hidden, its hash still differs from the
 * baseline, and the badge lights — while the drawer, which drops the hidden field, shows nothing.
 * The mismatch is born right here, where a section-level hash meets field-level hiding. We keep it
 * to keep detection a cheap section comparison, and `computeHashes` stays blind to hide-state.
 */
export function hasUpdatesAvailable(master: CV, tailored: CV): boolean {
	const baseline = tailored.baselineHashes;
	if (!baseline) return false;

	const masterHidden = new Set(master.hidden);
	const tailoredHidden = new Set(tailored.hidden);

	for (const key of SECTION_KEYS) {
		const sectionPath = [{ field: key }];
		if (isPathHidden(masterHidden, sectionPath)) continue;
		if (isPathHidden(tailoredHidden, sectionPath)) continue;
		if (master.hashes[key] !== baseline[key]) return true;
	}

	return false;
}
