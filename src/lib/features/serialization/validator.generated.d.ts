// @generated — do not edit. Run 'pnpm gen:schema' to regenerate.
	import type { CvDocument } from './document.generated';
	interface ValidateFn {
	  (data: unknown): data is CvDocument;
	  errors?: { instancePath: string; message?: string; [k: string]: unknown }[] | null;
	}
	declare const validate: ValidateFn;
	export default validate;
