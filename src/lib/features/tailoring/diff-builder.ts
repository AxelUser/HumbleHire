import type { CVBlocks, ObjectId, TextBlock, TextBlockKey, ListBlockKey } from '$lib/types/cv';
import type { AnyEntry, DiffItem, NestedListKey } from './types';

type ListBlockEntry<K extends ListBlockKey> = CVBlocks[K] extends Array<infer E> ? E : never;

type NestedListFieldKey<E> = {
	[K in keyof E]: E[K] extends Array<{ objectId: ObjectId }> ? K : never;
}[keyof E];

type NestedListItem<E, K extends NestedListFieldKey<E>> = E[K] extends Array<infer I> ? I : never;

const TEXT_BLOCK_KEYS: ReadonlySet<string> = new Set<TextBlockKey>([
	'fullName',
	'position',
	'location'
]);

export class DiffRoot {
	readonly items: DiffItem[] = [];

	atBlock<K extends TextBlockKey>(key: K): TextBlockBuilder;
	atBlock<K extends ListBlockKey>(
		key: K
	): ListBuilder<K, ListBlockEntry<K> & { objectId: ObjectId }>;
	atBlock(
		key: TextBlockKey | ListBlockKey
	): TextBlockBuilder | ListBuilder<ListBlockKey, { objectId: ObjectId }> {
		if (TEXT_BLOCK_KEYS.has(key)) {
			return new TextBlockBuilder(this, key as TextBlockKey);
		}
		const listKey = key as ListBlockKey;
		return new ListBuilder(this, listKey);
	}
}

export class TextBlockBuilder {
	constructor(
		private readonly root: DiffRoot,
		private readonly blockKey: TextBlockKey
	) {}

	modified(objectId: ObjectId, before: string, after: string): void {
		this.root.items.push({
			type: 'textModified',
			blockKey: this.blockKey,
			objectId,
			before,
			after
		});
	}
}

export class ListBuilder<K extends ListBlockKey, E extends { objectId: ObjectId }> {
	constructor(
		private readonly root: DiffRoot,
		private readonly blockKey: K,
		private readonly parentObjectId?: ObjectId,
		private readonly nestedListKey?: NestedListKey
	) {}

	entryAdded(entry: E): void {
		this.root.items.push({
			type: 'entryAdded',
			blockKey: this.blockKey,
			objectId: entry.objectId,
			parentObjectId: this.parentObjectId,
			nestedListKey: this.nestedListKey,
			entry: entry as unknown as AnyEntry
		});
	}

	entryRemoved(entry: E): void {
		this.root.items.push({
			type: 'entryRemoved',
			blockKey: this.blockKey,
			objectId: entry.objectId,
			parentObjectId: this.parentObjectId,
			nestedListKey: this.nestedListKey,
			entry: entry as unknown as AnyEntry
		});
	}

	atEntry(entry: E): EntryBuilder<K, E> {
		return new EntryBuilder(
			this.root,
			this.blockKey,
			entry,
			this.parentObjectId,
			this.nestedListKey
		);
	}
}

export class EntryBuilder<K extends ListBlockKey, E extends { objectId: ObjectId }> {
	constructor(
		private readonly root: DiffRoot,
		private readonly blockKey: K,
		private readonly entry: E,
		private readonly parentObjectId?: ObjectId,
		private readonly nestedListKey?: NestedListKey
	) {}

	modified(before: Partial<E>, after: Partial<E>): void {
		this.root.items.push({
			type: 'entryModified',
			blockKey: this.blockKey,
			objectId: this.entry.objectId,
			parentObjectId: this.parentObjectId,
			nestedListKey: this.nestedListKey,
			before: before as Record<string, unknown>,
			after: after as Record<string, unknown>
		});
	}

	atList<L extends NestedListFieldKey<E>>(
		listKey: L
	): ListBuilder<K, NestedListItem<E, L> & { objectId: ObjectId }> {
		return new ListBuilder(
			this.root,
			this.blockKey,
			this.entry.objectId,
			String(listKey) as NestedListKey
		);
	}
}
