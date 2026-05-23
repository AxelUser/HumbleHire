export type SaveStatus =
	| { status: 'idle' }
	| { status: 'saving' }
	| { status: 'saved'; savedAt: number };
