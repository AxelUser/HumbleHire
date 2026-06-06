import { parseDocument } from './parse';
import { fromDocument, unmappedSections } from './serialize';
import { db } from '$lib/db/index';
import type { CV } from '$lib/types/cv';
import type { DocumentError } from './parse';

export type ImportPersistenceError = { kind: 'persistence'; message: string };

export type ImportError = DocumentError | ImportPersistenceError;

export type ImportResult =
	| { ok: true; cv: CV; dropped: string[] }
	| { ok: false; error: ImportError };

export async function importDocument(text: string): Promise<ImportResult> {
	const parsed = parseDocument(text);
	if (!parsed.ok) return { ok: false, error: parsed.error };

	const dropped = unmappedSections(parsed.doc);
	const cv = fromDocument(parsed.doc);

	try {
		await db.cvs.add(cv);
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Could not save the imported CV.';
		return { ok: false, error: { kind: 'persistence', message } };
	}

	return { ok: true, cv, dropped };
}
