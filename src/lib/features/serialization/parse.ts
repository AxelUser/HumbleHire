import validate from './validator.generated.js';
import type { CvDocument } from './document.generated.js';

export type SchemaIssue = { path: string; message: string };

export type DocumentError =
	| { kind: 'not-json'; message: string }
	| { kind: 'schema'; message: string; issues: SchemaIssue[] }
	| { kind: 'unsupported-version'; version: string };

export type ParseResult = { ok: true; doc: CvDocument } | { ok: false; error: DocumentError };

const SCHEMA_VERSION = '0.0.1';

function isVersionSupported(version: string): boolean {
	const [ma, mi, pa] = version.split('.').map(Number);
	const [sa, si, sp] = SCHEMA_VERSION.split('.').map(Number);
	if (ma !== sa) return ma < sa;
	if (mi !== si) return mi < si;
	return pa <= sp;
}

export function parseDocument(text: string): ParseResult {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch (e) {
		return { ok: false, error: { kind: 'not-json', message: (e as Error).message } };
	}

	if (!validate(data)) {
		const issues = (validate.errors ?? []).map((err) => ({
			path: err.instancePath || '/',
			message: err.message ?? 'invalid'
		}));
		return {
			ok: false,
			error: { kind: 'schema', message: 'File does not match the expected schema.', issues }
		};
	}

	const version = data.meta?.humblehire?.schemaVersion;
	if (version && !isVersionSupported(version)) {
		return { ok: false, error: { kind: 'unsupported-version', version } };
	}

	return { ok: true, doc: data };
}
