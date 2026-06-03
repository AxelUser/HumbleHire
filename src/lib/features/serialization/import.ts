import { parseDocument } from './parse';
import { fromDocument, unmappedSections } from './serialize';
import { computeBlockHashes } from '$lib/features/tailoring/hash';
import { db } from '$lib/db/index';
import type { CV } from '$lib/types/cv';
import type { DocumentError } from './parse';

export type ImportResult =
	| { ok: true; cv: CV; dropped: string[] }
	| { ok: false; error: DocumentError };

export async function importDocument(text: string): Promise<ImportResult> {
	const parsed = parseDocument(text);
	if (!parsed.ok) return { ok: false, error: parsed.error };

	const dropped = unmappedSections(parsed.doc);
	const cv = fromDocument(parsed.doc);
	cv.blockHashes = computeBlockHashes(cv.blocks);
	await db.cvs.add(cv);
	return { ok: true, cv, dropped };
}
