import { describe, expect, it } from 'vitest';
import type { CVContent } from '$lib/types/cv';
import { project, resolve, type ScalarNode, type SyncNode } from './resolve';
import { encodePath, type Path } from './paths';
import { completeContent, emptyContent, makeWork, str } from './_fixtures';

function scalarLeaves(node: SyncNode, acc: ScalarNode[] = []): ScalarNode[] {
	if (node.kind === 'scalar') acc.push(node);
	else if (node.kind === 'object') for (const f of Object.values(node.fields)) scalarLeaves(f, acc);
	else for (const item of node.items) scalarLeaves(item, acc);
	return acc;
}

describe('resolve', () => {
	it('resolves a basics scalar by field path', () => {
		const content = completeContent();
		const r = resolve(content, [{ field: 'basics' }, { field: 'fullName' }]);
		expect(r).toEqual({ kind: 'scalar', value: 'Jane Doe' });
	});

	it('resolves a list entry by id, not by position', () => {
		const a = makeWork('Acme', 'Eng');
		const b = makeWork('Beta', 'Eng');
		const content = emptyContent({ work: [a, b] });
		const r = resolve(content, [{ field: 'work' }, { id: b.objectId }]);
		expect(r.kind === 'object' && r.value).toBe(b);
	});

	it('finds the same entry after the list is reordered', () => {
		const a = makeWork('Acme', 'Eng');
		const b = makeWork('Beta', 'Eng');
		const content = emptyContent({ work: [a, b] });
		const path: Path = [{ field: 'work' }, { id: a.objectId }];
		content.work.reverse();
		const r = resolve(content, path);
		expect(r.kind === 'object' && r.value).toBe(a);
	});

	it('resolves an arbitrarily deep nested-list scalar', () => {
		const hl = str('Cut latency');
		const job = makeWork('Acme', 'Eng', { highlights: [hl] });
		const content = emptyContent({ work: [job] });
		const path: Path = [
			{ field: 'work' },
			{ id: job.objectId },
			{ field: 'highlights' },
			{ id: hl.objectId },
			{ field: 'value' }
		];
		expect(resolve(content, path)).toEqual({ kind: 'scalar', value: 'Cut latency' });
	});

	it('reports a missing id', () => {
		const content = emptyContent({ work: [makeWork('Acme', 'Eng')] });
		const r = resolve(content, [{ field: 'work' }, { id: 'nope' as never }]);
		expect(r.kind).toBe('missing');
	});

	it('resolves a whole list', () => {
		const a = makeWork('Acme', 'Eng');
		const content = emptyContent({ work: [a] });
		const r = resolve(content, [{ field: 'work' }]);
		expect(r.kind === 'list' && r.value).toEqual([a]);
	});
});

describe('project', () => {
	it('round-trips every projected scalar path back to its value via resolve', () => {
		const content: CVContent = completeContent();
		const leaves = scalarLeaves(project(content));
		expect(leaves.length).toBeGreaterThan(20);
		for (const leaf of leaves) {
			expect(resolve(content, leaf.path)).toEqual({ kind: 'scalar', value: leaf.value });
		}
	});

	it('addresses list items by id segments', () => {
		const job = makeWork('Acme', 'Eng');
		const tree = project(emptyContent({ work: [job] }));
		const work = tree.fields.work;
		expect(work.kind).toBe('list');
		if (work.kind === 'list') {
			expect(encodePath(work.items[0].path)).toBe(`work/${job.objectId}/`);
		}
	});
});
