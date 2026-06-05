declare module '@jsonresume/schema' {
	export function validate(
		resumeJson: unknown,
		callback: (errors: unknown, valid: boolean) => void
	): void;
}
