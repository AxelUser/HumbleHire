// Compile the HumbleHire resume JSON Schema into a standalone ajv validator.
// The generated file requires no ajv runtime in the browser bundle.
// Run with: pnpm gen:validator
import Ajv from 'ajv';
import standaloneCode from 'ajv/dist/standalone/index.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const humblehireSchema = JSON.parse(
	readFileSync(join(root, 'static/schema/resume/v0.0.1.json'), 'utf8')
);
const jsonresumeSchema = JSON.parse(
	readFileSync(
		join(root, 'src/lib/features/serialization/jsonresume.schema.json'),
		'utf8'
	)
);

// strict: false — the JSON Resume schema uses format: "uri" / "email" which ajv
// doesn't know by default; rather than pull in ajv-formats just for codegen,
// we disable strict-format enforcement. Format keywords are still present in the
// generated validator but treated as always-passing (consistent with JSON Resume's
// own tooling, which does the same).
const ajv = new Ajv({ code: { source: true, esm: true }, allErrors: true, strict: false });

// Register the JSON Resume base schema under the $ref URL our superset uses.
ajv.addSchema(
	jsonresumeSchema,
	'https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json'
);

const validate = ajv.compile(humblehireSchema);
const moduleCode = standaloneCode(ajv, validate);

const outDir = join(root, 'src/lib/features/serialization');

writeFileSync(
	join(outDir, 'validator.generated.js'),
	`// @generated — do not edit. Run 'pnpm gen:validator' to regenerate.\n${moduleCode}`
);

writeFileSync(
	join(outDir, 'validator.generated.d.ts'),
	`// @generated — do not edit.\nimport type { CvDocument } from './document';\ndeclare const validate: (data: unknown) => data is CvDocument;\nexport default validate;\n`
);

console.log('Validator generated at src/lib/features/serialization/validator.generated.{js,d.ts}');
