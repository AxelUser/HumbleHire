import type { Path } from './paths';
import type { Scalar } from './resolve';

export type DiffChange = 'modified' | 'added' | 'removed';

/**
 * A single unit of change, addressed by a path into CV content.
 * - `modified` always ends at a scalar (carries before/after).
 * - `added`/`removed` always end at a list-entry id.
 * An object is never itself a change unit, so a job with three changed fields yields three items.
 */
export type DiffItem =
	| { change: 'modified'; path: Path; before: Scalar; after: Scalar }
	| { change: 'added' | 'removed'; path: Path };
