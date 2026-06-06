// Generate TypeScript types and a standalone ajv validator from the HumbleHire resume JSON Schema.
// Types are generated with json-schema-to-typescript; the validator is compiled with ajv standalone.
// Neither the types nor the validator require any runtime schema library in the browser bundle.
// Run with: pnpm gen:schema
import { compile } from 'json-schema-to-typescript';
import Ajv from 'ajv';
import { fastFormats, fullFormats } from 'ajv-formats/dist/formats.js';
import standaloneCode from 'ajv/dist/standalone/index.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

class TracedFileWriter {
	constructor(outDir) {
		this.outDir = outDir;
		this.written = [];
	}

	writeFile(filename, content) {
		this.written.push(join(this.outDir, filename));
		writeFileSync(join(this.outDir, filename), content);
	}

	files() {
		return this.written;
	}
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = join(root, 'static/schema/resume/v0.1.0.json');
const outDir = join(root, 'src/lib/features/serialization');

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

// --- TypeScript types ---
// Pass title:'CvDocument' in-memory so the root interface is named CvDocument; the published
// schema file keeps its human-readable title "HumbleHire Resume v0.0.1".
const ts = await compile({ ...schema, title: 'CvDocument' }, 'CvDocument', {
	bannerComment: "// @generated — do not edit. Run 'pnpm gen:schema' to regenerate.",
	additionalProperties: false,
	cwd: join(root, 'static/schema/resume'),
	format: true
});

const writer = new TracedFileWriter(outDir);

writer.writeFile('document.generated.ts', ts);

// --- ajv standalone validator ---
// Register only uri + email as RegExp formats so standalone codegen inlines them.
// addFormats() emits require("ajv-formats/...") which breaks ESM/Vite (https://github.com/ajv-validator/ajv-formats/issues/85).
const ajv = new Ajv({ code: { source: true, esm: true }, allErrors: true, strict: false });
ajv.addFormat('email', fullFormats.email);
ajv.addFormat('uri', fastFormats.uri);
const validate = ajv.compile(schema);
const moduleCode = standaloneCode(ajv, validate);

writer.writeFile(
	'validator.generated.js',
	`// @generated — do not edit. Run 'pnpm gen:schema' to regenerate.\n${moduleCode}`
);

writer.writeFile(
	'validator.generated.d.ts',
	`// @generated — do not edit. Run 'pnpm gen:schema' to regenerate.
	import type { CvDocument } from './document.generated';
	interface ValidateFn {
	  (data: unknown): data is CvDocument;
	  errors?: { instancePath: string; message?: string; [k: string]: unknown }[] | null;
	}
	declare const validate: ValidateFn;
	export default validate;
`
);

console.log(`Generated:\n ${writer.files().join('\n ')}`);
