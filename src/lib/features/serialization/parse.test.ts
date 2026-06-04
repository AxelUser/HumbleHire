import { describe, expect, it } from 'vitest';
import { parseDocument } from './parse';

// --- helpers ---

function json(obj: unknown): string {
	return JSON.stringify(obj);
}

// A minimal valid JSON Resume document (sparse — all fields optional in the schema).
const SPARSE = json({});

// A minimal valid HumbleHire JSON document.
const MINIMAL_HH = json({
	$schema: 'https://humblehire.app/schema/resume/v0.0.1.json',
	basics: { name: 'Jane Doe' },
	meta: { humblehire: { schemaVersion: '0.0.1' } }
});

// --- not-json ---

describe('parseDocument — not-json', () => {
	it('returns not-json for empty string', () => {
		const r = parseDocument('');
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.kind).toBe('not-json');
	});

	it('returns not-json for malformed JSON', () => {
		const r = parseDocument('{name: "bad"}');
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.kind).toBe('not-json');
	});

	it('includes a message', () => {
		const r = parseDocument('not json');
		expect(r.ok).toBe(false);
		if (!r.ok && r.error.kind === 'not-json') expect(r.error.message).toBeTruthy();
	});
});

// --- schema ---

describe('parseDocument — schema errors', () => {
	it('returns schema error when basics.name is not a string', () => {
		const r = parseDocument(json({ basics: { name: 42 } }));
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.kind).toBe('schema');
	});

	it('returns schema error when work item startDate fails iso8601 pattern', () => {
		const r = parseDocument(json({ work: [{ startDate: 'not-a-date' }] }));
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.kind).toBe('schema');
	});

	it('returns schema issues array', () => {
		const r = parseDocument(json({ basics: { name: 42 } }));
		expect(r.ok).toBe(false);
		if (!r.ok && r.error.kind === 'schema') {
			expect(r.error.issues.length).toBeGreaterThan(0);
			expect(r.error.issues[0].message).toBeTruthy();
		}
	});

	it('returns schema error when meta.humblehire exists but schemaVersion is missing', () => {
		const r = parseDocument(json({ meta: { humblehire: {} } }));
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.kind).toBe('schema');
	});

	it('returns schema error when meta.humblehire.contacts item is missing label', () => {
		const r = parseDocument(
			json({ meta: { humblehire: { schemaVersion: '0.0.1', contacts: [{ value: 'x' }] } } })
		);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.kind).toBe('schema');
	});
});

// --- unsupported-version ---

describe('parseDocument — unsupported-version', () => {
	it('rejects a future major version', () => {
		const r = parseDocument(json({ meta: { humblehire: { schemaVersion: '99.0.0' } } }));
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error.kind).toBe('unsupported-version');
			if (r.error.kind === 'unsupported-version') expect(r.error.version).toBe('99.0.0');
		}
	});

	it('rejects a future minor version', () => {
		const r = parseDocument(json({ meta: { humblehire: { schemaVersion: '0.99.0' } } }));
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error.kind).toBe('unsupported-version');
	});
});

// --- ok cases ---

describe('parseDocument — ok', () => {
	it('accepts an empty object (sparse foreign JSON Resume)', () => {
		const r = parseDocument(SPARSE);
		expect(r.ok).toBe(true);
	});

	it('accepts a minimal HumbleHire file', () => {
		const r = parseDocument(MINIMAL_HH);
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.doc.basics?.name).toBe('Jane Doe');
	});

	it('accepts the current schema version', () => {
		const r = parseDocument(json({ meta: { humblehire: { schemaVersion: '0.0.1' } } }));
		expect(r.ok).toBe(true);
	});

	it('accepts documents with no meta (plain JSON Resume)', () => {
		const r = parseDocument(json({ basics: { name: 'Bob', label: 'Engineer' }, work: [] }));
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.doc.basics?.name).toBe('Bob');
	});

	it('accepts a foreign JSON Resume with all standard sections', () => {
		const r = parseDocument(
			json({
				basics: { name: 'Alice', email: 'alice@example.com', location: { city: 'Berlin' } },
				work: [{ name: 'ACME', position: 'Dev', startDate: '2020-01' }],
				education: [{ institution: 'TU Berlin', studyType: 'BSc', area: 'CS' }],
				skills: [{ name: 'Languages', keywords: ['Go'] }],
				projects: [{ name: 'Foo', url: 'https://example.com' }]
			})
		);
		expect(r.ok).toBe(true);
	});

	it('returned doc is typed as CvDocument (no cast)', () => {
		const r = parseDocument(MINIMAL_HH);
		if (r.ok) {
			// Type-level check: accessing typed CvDocument fields compiles without assertion
			const _name: string | undefined = r.doc.basics?.name;
			expect(_name).toBe('Jane Doe');
		}
	});
});
