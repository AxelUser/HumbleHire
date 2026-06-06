import { describe, expect, it } from 'vitest';
import { CV_DESCRIPTOR, type NodeDescriptor, type ObjectDescriptor } from './descriptor';
import { completeContent } from './_fixtures';

/**
 * Coverage guard: every field of CVContent must be reachable from CV_DESCRIPTOR. A field
 * with no descriptor node would silently fall out of sync, so this fails loudly instead.
 * Walks a complete fixture (every section populated, every field set) against the descriptor.
 */
function missingNodes(value: unknown, node: NodeDescriptor, path: string): string[] {
	const missing: string[] = [];

	if (node.kind === 'object') {
		const obj = value as Record<string, unknown>;
		for (const key of Object.keys(obj)) {
			if (key === 'objectId') continue;
			const child = (node as ObjectDescriptor).fields[key];
			if (!child) {
				missing.push(`${path}.${key}`);
				continue;
			}
			missing.push(...missingNodes(obj[key], child, `${path}.${key}`));
		}
	} else if (node.kind === 'list') {
		const arr = value as unknown[];
		for (const item of arr) {
			missing.push(...missingNodes(item, node.entry, `${path}[]`));
		}
	}
	// scalar: leaf, nothing to descend into

	return missing;
}

describe('CV_DESCRIPTOR coverage', () => {
	it('has a node for every field in a complete CVContent', () => {
		const content = completeContent();
		const missing: string[] = [];
		for (const key of Object.keys(content)) {
			const node = CV_DESCRIPTOR.fields[key];
			if (!node) {
				missing.push(key);
				continue;
			}
			missing.push(
				...missingNodes((content as unknown as Record<string, unknown>)[key], node, key)
			);
		}
		expect(missing).toEqual([]);
	});
});
